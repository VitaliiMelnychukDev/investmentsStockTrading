import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  ILike,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ShareAvailable } from '../entities/share-available.entity';
import { ShareAvailableError } from '../types/error';
import { IShareOnStock, SendShareOnStock } from '../types/share-available';
import { SearchDto } from '../dtos/shared/search.dto';
import { PaginationService } from './pagination.service';
import { ShareOnStockHelper } from '../helpers/share-on-stock.helper';
import { BuyDto } from '../dtos/share-available/buy.dto';
import { OperationService } from './operation.service';
import { AddOperation, OperationStatus } from '../types/operation';
import { AccountService } from './account.service';
import { ProducerService } from './producer.service';
import { Topic } from '../types/kafka';
import { Operation } from '../entities/operation.entity';
import { QueryRunnerOnly } from '../types/general';
import { ShareProposal } from '../entities/share-proposal.entity';

@Injectable()
export class ShareAvailableService {
  constructor(
    @InjectRepository(ShareAvailable)
    private shareAvailableRepository: Repository<ShareAvailable>,
    private paginationService: PaginationService,
    private dataSource: DataSource,
    private operationService: OperationService,
    private accountService: AccountService,
    private producerService: ProducerService,
  ) {}

  public async getSharesCount(
    shareId: number,
    accountId: number,
  ): Promise<number> {
    try {
      const shareCount = await this.shareAvailableRepository
        .createQueryBuilder('shareAvailable')
        .select('sum("shareAvailable"."amount")', 'amount')
        .groupBy('"accountId"')
        .addGroupBy('"shareId"')
        .addGroupBy('"removed"')
        .having('shareAvailable.accountId = :accountId', { accountId })
        .andHaving('shareAvailable.shareId = :shareId', { shareId })
        .andHaving('shareAvailable.removed = :removed', { removed: false })
        .getRawOne<{ amount: number }>();

      const availableShareCount = shareCount ? shareCount.amount : 0;
      const notFinishedOperationsShareCount =
        await this.operationService.getSharesCount(
          shareId,
          accountId,
          OperationStatus.PendingPayment,
        );
      return notFinishedOperationsShareCount + availableShareCount;
    } catch (e) {
      throw new BadRequestException(ShareAvailableError.GetSharesCountFail);
    }
  }

  public async onTransactionFailed(operationId: number): Promise<void> {
    let operation: Operation;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');

    try {
      operation = await this.operationService.get({
        id: operationId,
      });

      if (!operation) return;

      const shareAvailable: ShareAvailable | null = await this.get(
        operation.shareAvailableId,
        ShareAvailableError.OnTransactionFail,
      );

      if (!shareAvailable) {
        throw new BadRequestException(ShareAvailableError.OnTransactionFail);
      }

      await this.operationService.updateStatus({
        id: operationId,
        newStatus: OperationStatus.Rejected,
        queryRunner,
      });

      if (!shareAvailable.removed) {
        await this.shareAvailableRepository.update(
          {
            id: shareAvailable.id,
          },
          {
            amount: shareAvailable.amount + operation.amount,
          },
        );
      }

      if (operation.shareProposalId) {
        const shareProposalRepository: Repository<ShareProposal> =
          queryRunner.manager.getRepository(ShareProposal);

        const shareProposal: ShareProposal | null =
          await shareProposalRepository.findOne({
            where: {
              id: operation.shareProposalId,
            },
          });

        await queryRunner.manager.getRepository(ShareProposal).update(
          {
            id: operation.shareProposalId,
          },
          {
            amount: shareProposal.amount + operation.amount,
          },
        );
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch {
      await queryRunner.release();
      await queryRunner.rollbackTransaction();

      throw new BadRequestException(ShareAvailableError.OnTransactionFail);
    }
  }

  public async buy(
    accountId: number,
    id: number,
    params: BuyDto,
  ): Promise<void> {
    await this.accountService.getAccount(
      accountId,
      ShareAvailableError.ShareBuyFailed,
      true,
    );

    let shareAvailable: ShareAvailable | null = null;

    try {
      shareAvailable = await this.shareAvailableRepository.findOne({
        where: {
          id,
        },
        relations: ['account', 'share'],
      });
    } catch {
      throw new BadRequestException(ShareAvailableError.ShareBuyFailed);
    }

    if (
      !shareAvailable ||
      shareAvailable.accountId === accountId ||
      !shareAvailable.account.activated
    ) {
      throw new BadRequestException(ShareAvailableError.ShareBuyFailed);
    }

    if (shareAvailable.amount < params.amount) {
      throw new BadRequestException(ShareAvailableError.BuyShareAmountTooMuch);
    }

    const price = shareAvailable.marketPrice
      ? shareAvailable.share.price
      : shareAvailable.price;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');

    let shareAvailableForUpdate: ShareAvailable | null = null;

    try {
      shareAvailableForUpdate = await this.get(
        id,
        ShareAvailableError.ShareBuyFailed,
        false,
        queryRunner,
      );
    } catch {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(ShareAvailableError.ShareBuyFailed);
    }

    try {
      const newOperation: AddOperation = {
        sellerId: shareAvailableForUpdate.accountId,
        buyerId: accountId,
        shareId: shareAvailableForUpdate.shareId,
        shareAvailableId: id,
        amount: params.amount,
        price,
        queryRunner,
      };

      const savedOperation: Operation = await this.operationService.add(
        newOperation,
      );
      await queryRunner.manager.getRepository(ShareAvailable).update(
        {
          id,
        },
        {
          amount: shareAvailableForUpdate.amount - params.amount,
        },
      );

      await this.producerService.sendMessage(Topic.Transactions, accountId, {
        cardNumber: params.cardNumber,
        cvv: params.cvv,
        expirationYear: params.expirationYear,
        expirationMonth: params.expirationMonth,
        receiverCardNumber: shareAvailable.account.cardNumber,
        amount: params.amount * price,
        identifierId: savedOperation.id,
      });
      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(ShareAvailableError.ShareBuyFailed);
    }
  }

  public async sendShareOnStock(
    params: SendShareOnStock,
  ): Promise<ShareAvailable> {
    try {
      const repository = this.getRepository(params);

      const newShareAvailable: ShareAvailable = new ShareAvailable();
      newShareAvailable.shareId = params.shareId;
      newShareAvailable.accountId = params.accountId;
      newShareAvailable.amount = params.amount;
      newShareAvailable.marketPrice = !params.price;
      newShareAvailable.price = params.price || null;
      newShareAvailable.removed = params.removed || false;

      return await repository.save(newShareAvailable);
    } catch (e) {
      throw new BadRequestException(ShareAvailableError.CreateShareOnStockFail);
    }
  }

  public async search(
    searchParams: SearchDto,
    accountId: number = null,
  ): Promise<IShareOnStock[]> {
    try {
      const sharedWhereOptions: FindOptionsWhere<ShareAvailable> = {
        ...(accountId !== 0 && { accountId }),
        removed: false,
      };
      let whereOptions:
        | FindOptionsWhere<ShareAvailable>
        | FindOptionsWhere<ShareAvailable>[] = {};
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

      const shareAvailables: ShareAvailable[] =
        await this.shareAvailableRepository.find({
          ...this.paginationService.getPaginationParams(searchParams),
          where: whereOptions,
          relations: ['account', 'share'],
        });

      return shareAvailables.map((shareAvailable: ShareAvailable) =>
        ShareOnStockHelper.transform(shareAvailable),
      );
    } catch {
      throw new BadRequestException(ShareAvailableError.SearchShareOnStockFail);
    }
  }

  public async delete(accountId: number, id: number): Promise<void> {
    const shareAvailable: ShareAvailable | null = await this.get(
      id,
      ShareAvailableError.DeleteShareOnStockFail,
      true,
    );

    if (shareAvailable.accountId !== accountId) {
      throw new BadRequestException(ShareAvailableError.DeleteShareOnStockFail);
    }

    try {
      await this.shareAvailableRepository.update(
        {
          id,
        },
        {
          removed: true,
        },
      );
    } catch {
      throw new BadRequestException(ShareAvailableError.DeleteShareOnStockFail);
    }
  }

  private async get(
    id: number,
    error: ShareAvailableError,
    throwIfNotFound = false,
    queryRunner?: QueryRunner,
  ): Promise<ShareAvailable | null> {
    let shareAvailable: ShareAvailable | number = null;

    try {
      const shareAvailableRepository: Repository<ShareAvailable> =
        this.getRepository({ queryRunner });
      shareAvailable = await shareAvailableRepository.findOne({
        where: {
          id,
          removed: false,
        },
        ...(queryRunner && {
          lock: { mode: 'for_no_key_update' },
        }),
      });
    } catch {
      throw new BadRequestException(error);
    }

    if (!shareAvailable && throwIfNotFound) {
      throw new NotFoundException(ShareAvailableError.ShareOnStockNotFound);
    }

    return shareAvailable;
  }

  private getRepository(params: QueryRunnerOnly): Repository<ShareAvailable> {
    return params.queryRunner
      ? params.queryRunner.manager.getRepository(ShareAvailable)
      : this.shareAvailableRepository;
  }
}
