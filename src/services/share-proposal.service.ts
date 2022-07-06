import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShareProposal } from '../entities/share-proposal.entity';
import {
  DataSource,
  FindOptionsWhere,
  ILike,
  LessThan,
  Repository,
} from 'typeorm';
import { AddDto } from '../dtos/share-proposal/add.dto';
import { ShareError, ShareProposalError } from '../types/error';
import { ShareService } from './share.service';
import { Share } from '../entities/share.entity';
import { SearchDto } from '../dtos/shared/search.dto';
import { PaginationService } from './pagination.service';
import { ShareProposalsHelper } from '../helpers/share-proposals.helper';
import { IGetShareProposal, IShareProposal } from '../types/share-proposal';
import { AccountService } from './account.service';
import { ShareAvailableService } from './share-available.service';
import { OperationService } from './operation.service';
import { ShareOwnerService } from './share-owner.service';
import { ShareOwner } from '../entities/share-owner.entity';
import { ShareAvailable } from '../entities/share-available.entity';
import { Topic } from '../types/kafka';
import { ProducerService } from './producer.service';
import { Operation } from '../entities/operation.entity';
import { Account } from '../entities/account.entity';

@Injectable()
export class ShareProposalService {
  private readonly maxProposalsPerAccount = 10;
  private readonly proposalExpirationDays = 10;

  constructor(
    @InjectRepository(ShareProposal)
    private shareProposalRepository: Repository<ShareProposal>,
    private shareService: ShareService,
    private shareAvailableService: ShareAvailableService,
    private shareOwnerService: ShareOwnerService,
    private operationService: OperationService,
    private paginationService: PaginationService,
    private accountService: AccountService,
    private dataSource: DataSource,
    private producerService: ProducerService,
  ) {}

  public async takeProposal(
    accountId: number,
    id: number,
    amount: number,
  ): Promise<void> {
    const account: Account = await this.accountService.getAccount(
      accountId,
      ShareProposalError.ShareProposalTakeProposalFail,
      true,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');

    let shareProposal: ShareProposal | null = null;
    let shareOwner: ShareOwner | null = null;
    let shareOwnerAvailbleShareCount = 0;

    try {
      shareProposal = await this.get({
        id,
        queryRunner,
        error: ShareProposalError.ShareProposalTakeProposalFail,
      });

      if (shareProposal) {
        shareOwner = await this.shareOwnerService.get({
          accountId,
          shareId: shareProposal.shareId,
        });
      }

      if (shareOwner) {
        shareOwnerAvailbleShareCount =
          await this.shareAvailableService.getSharesCount(
            shareProposal.shareId,
            accountId,
          );
      }
    } catch {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(
        ShareProposalError.ShareProposalTakeProposalFail,
      );
    }

    if (!shareProposal) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new NotFoundException(ShareProposalError.ShareProposalNotFound);
    }

    if (
      shareProposal.amount < amount ||
      !shareOwner ||
      shareOwner.amount < amount + shareOwnerAvailbleShareCount
    ) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(
        ShareProposalError.TakeProposalAmountTooMuch,
      );
    }

    try {
      const shareAvailable: ShareAvailable =
        await this.shareAvailableService.sendShareOnStock({
          accountId,
          shareId: shareProposal.shareId,
          amount: 0,
          price: shareProposal.price,
          queryRunner,
        });

      const savedOperation: Operation = await this.operationService.add({
        buyerId: shareProposal.accountId,
        sellerId: accountId,
        shareId: shareProposal.id,
        amount,
        price: shareProposal.price,
        shareAvailableId: shareAvailable.id,
        shareProposalId: shareProposal.id,
        queryRunner,
      });

      await queryRunner.manager.getRepository(ShareProposal).update(
        {
          id,
        },
        {
          amount: shareProposal.amount - amount,
        },
      );

      await this.producerService.sendMessage(
        Topic.CodeTransactions,
        accountId,
        {
          cardCode: shareProposal.cardCode,
          receiverCardNumber: account.cardNumber,
          amount: amount * shareProposal.price,
          identifierId: savedOperation.id,
        },
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(
        ShareProposalError.ShareProposalTakeProposalFail,
      );
    }
  }

  public async search(
    searchParams: SearchDto,
    accountId: number = null,
  ): Promise<IShareProposal[]> {
    try {
      const sharedWhereOptions: FindOptionsWhere<ShareProposal> = {
        ...(accountId !== 0 && { accountId }),
        removed: false,
      };
      let whereOptions:
        | FindOptionsWhere<ShareProposal>
        | FindOptionsWhere<ShareProposal>[] = {};
      if (!searchParams.searchTerm) {
        whereOptions = sharedWhereOptions;
      } else {
        whereOptions = [
          {
            share: {
              ticker: ILike(`%${searchParams.searchTerm}%`),
            },
            ...sharedWhereOptions,
          },
          {
            share: {
              name: ILike(`%${searchParams.searchTerm}%`),
            },
            ...sharedWhereOptions,
          },
        ];
      }

      const shareProposals: ShareProposal[] =
        await this.shareProposalRepository.find({
          ...this.paginationService.getPaginationParams(searchParams),
          where: whereOptions,
          relations: ['account', 'share'],
        });

      const ownerAccount = !!accountId;

      return shareProposals.map((shareProposal: ShareProposal) =>
        ShareProposalsHelper.transform(shareProposal, ownerAccount),
      );
    } catch {
      throw new BadRequestException(ShareProposalError.ShareProposalSearchFail);
    }
  }

  public async create(accountId: number, params: AddDto): Promise<void> {
    await this.accountService.getAccount(
      accountId,
      ShareError.PriceUpdateFail,
      true,
    );

    let shareProposals: ShareProposal[] = [];
    try {
      shareProposals = await this.shareProposalRepository.find({
        where: {
          accountId,
          removed: false,
          expiredAt: LessThan(this.getProposalExpiration()),
        },
      });
    } catch {
      throw new BadRequestException(ShareProposalError.ShareProposalCreateFail);
    }

    if (shareProposals.length >= this.maxProposalsPerAccount) {
      throw new BadRequestException(ShareProposalError.ShareProposalMaxReached);
    }

    const share: Share = await this.shareService.get(
      params.ticker,
      ShareProposalError.ShareProposalCreateFail,
      true,
    );

    try {
      const newShareProposal = new ShareProposal();
      newShareProposal.accountId = accountId;
      newShareProposal.shareId = share.id;
      newShareProposal.amount = params.amount;
      newShareProposal.price = params.price;
      newShareProposal.cardCode = params.cardCode;
      newShareProposal.expiredAt = this.getProposalExpiration();

      await this.shareProposalRepository.save(newShareProposal);
    } catch {
      throw new BadRequestException(ShareProposalError.ShareProposalCreateFail);
    }
  }

  public async delete(accountId: number, id: number): Promise<void> {
    const shareProposal: ShareProposal | null = await this.get({
      id,
      error: ShareProposalError.ShareProposalDeleteFail,
      throwIfNotFound: true,
    });

    if (shareProposal.accountId !== accountId) {
      throw new BadRequestException(ShareProposalError.ShareProposalDeleteFail);
    }

    try {
      await this.shareProposalRepository.update(
        {
          id,
        },
        {
          removed: true,
        },
      );
    } catch {
      throw new BadRequestException(ShareProposalError.ShareProposalDeleteFail);
    }
  }

  private async get({
    id,
    error,
    throwIfNotFound = false,
    queryRunner,
  }: IGetShareProposal): Promise<ShareProposal | null> {
    let shareProposal: ShareProposal | number = null;
    const repository: Repository<ShareProposal> = queryRunner
      ? queryRunner.manager.getRepository(ShareProposal)
      : this.shareProposalRepository;

    try {
      shareProposal = await repository.findOne({
        where: {
          id,
          removed: false,
          expiredAt: LessThan(this.getProposalExpiration()),
        },
        ...(queryRunner && { lock: { mode: 'for_no_key_update' } }),
      });
    } catch {
      throw new BadRequestException(error);
    }

    if (!shareProposal && throwIfNotFound) {
      throw new BadRequestException(ShareProposalError.ShareProposalNotFound);
    }

    return shareProposal;
  }

  private getProposalExpiration(): number {
    const date = new Date();
    date.setDate(date.getDate() + this.proposalExpirationDays);

    return date.getTime();
  }
}
