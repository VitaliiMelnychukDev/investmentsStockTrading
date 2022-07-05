import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShareProposal } from '../entities/share-proposal.entity';
import { FindOptionsWhere, ILike, LessThan, Repository } from 'typeorm';
import { AddDto } from '../dtos/share-proposal/add.dto';
import { ShareError, ShareProposalError } from '../types/error';
import { ShareService } from './share.service';
import { Share } from '../entities/share.entity';
import { SearchDto } from '../dtos/shared/search.dto';
import { PaginationService } from './pagination.service';
import { ShareProposalsHelper } from '../helpers/share-proposals.helper';
import { IShareProposal } from '../types/share-proposal';
import { AccountService } from './account.service';

@Injectable()
export class ShareProposalService {
  private readonly maxProposalsPerAccount = 10;
  private readonly proposalExpirationDays = 10;

  constructor(
    @InjectRepository(ShareProposal)
    private shareProposalRepository: Repository<ShareProposal>,
    private shareService: ShareService,
    private paginationService: PaginationService,
    private accountService: AccountService,
  ) {}

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
    const shareProposal: ShareProposal | null = await this.get(
      id,
      ShareProposalError.ShareProposalDeleteFail,
      true,
    );

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

  private async get(
    id: number,
    error: ShareProposalError,
    throwIfNotFound = false,
  ): Promise<ShareProposal | null> {
    let shareProposal: ShareProposal | number = null;

    try {
      shareProposal = await this.shareProposalRepository.findOne({
        where: {
          id,
          removed: false,
          expiredAt: LessThan(this.getProposalExpiration()),
        },
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
