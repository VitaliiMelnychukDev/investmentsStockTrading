import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationService } from './pagination.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Share } from '../entities/share.entity';
import { DataSource, ILike, Repository } from 'typeorm';
import { CreateDto } from '../dtos/share/create.dto';
import { AccountService } from './account.service';
import { ShareError } from '../types/error';
import { Account } from '../entities/account.entity';
import { AccountRole } from '../types/account';
import { ShareOwnerService } from './share-owner.service';
import { SearchDto } from '../dtos/shared/search.dto';
import { IShareOwner, IShareOwnerBase } from '../types/share-owner';
import { ShareOwner } from '../entities/share-owner.entity';
import { IShare } from '../types/share';
import { ShareHelper } from '../helpers/share.helper';
import { SendOnStockDto } from '../dtos/share/send-on-stock.dto';
import { ShareAvailableService } from './share-available.service';
import { PaginationDto } from '../dtos/shared/pagination.dto';

@Injectable()
export class ShareService {
  constructor(
    @InjectRepository(Share) private shareRepository: Repository<Share>,
    private paginationService: PaginationService,
    private accountService: AccountService,
    private dataSource: DataSource,
    private shareOwnerService: ShareOwnerService,
    private shareAvailableService: ShareAvailableService,
  ) {}

  public async getOwners(
    companyId: number,
    ticker: string,
    paginationParams: PaginationDto,
  ): Promise<IShareOwner[]> {
    const share: Share = await this.get(
      ticker,
      ShareError.PriceUpdateFail,
      true,
    );

    if (share.accountId !== companyId) {
      throw new BadRequestException(ShareError.PriceUpdateFail);
    }

    return await this.shareOwnerService.getOwners(share.id, paginationParams);
  }

  public async updatePrice(
    companyId: number,
    ticker: string,
    newPrice: number,
  ): Promise<void> {
    const share: Share = await this.get(
      ticker,
      ShareError.PriceUpdateFail,
      true,
    );

    if (share.accountId !== companyId) {
      throw new BadRequestException(ShareError.PriceUpdateFail);
    }

    try {
      await this.shareRepository.update(
        {
          ticker,
        },
        {
          price: newPrice,
        },
      );
    } catch {
      throw new BadRequestException(ShareError.PriceUpdateFail);
    }
  }

  public async addShares(
    companyId: number,
    ticker: string,
    amount: number,
  ): Promise<void> {
    await this.accountService.getAccount(
      companyId,
      ShareError.PriceUpdateFail,
      true,
    );
    const share: Share | null = await this.get(
      ticker,
      ShareError.PriceUpdateFail,
      true,
    );

    if (share.accountId !== companyId) {
      throw new BadRequestException(ShareError.PriceUpdateFail);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');

    try {
      const shareOwnerBase: IShareOwnerBase = {
        accountId: companyId,
        shareId: share.id,
        queryRunner,
      };

      const shareOwner: ShareOwner = await this.shareOwnerService.get(
        shareOwnerBase,
      );
      if (shareOwner) {
        await this.shareOwnerService.update({
          ...shareOwnerBase,
          amount: shareOwner.amount + amount,
        });
      } else {
        await this.shareOwnerService.add({
          ...shareOwnerBase,
          amount,
        });
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(ShareError.AddShareFailed);
    }
  }

  public async search(searchParams: SearchDto): Promise<IShare[]> {
    try {
      const shares: Share[] = await this.shareRepository.find({
        ...this.paginationService.getPaginationParams(searchParams),
        where: searchParams.searchTerm
          ? [
              {
                ticker: ILike(`%${searchParams.searchTerm}%`),
              },
              {
                name: ILike(`%${searchParams.searchTerm}%`),
              },
            ]
          : {},
        relations: ['account'],
      });

      return shares.map((share: Share) => ShareHelper.transformShare(share));
    } catch {
      throw new BadRequestException(ShareError.SearchSharesFail);
    }
  }

  public async getCompanyShares(companyId: number): Promise<Share[]> {
    try {
      return await this.shareRepository.find({
        where: {
          accountId: companyId,
        },
      });
    } catch {
      throw new BadRequestException(ShareError.GetCompanySharesFail);
    }
  }

  public async create(companyId: number, params: CreateDto): Promise<void> {
    const account: Account = await this.accountService.getAccount(
      companyId,
      ShareError.AddShareFailed,
    );

    if (account.role !== AccountRole.Company) {
      throw new BadRequestException(ShareError.OnlyCompanyCanAddShare);
    }

    const share: Share | null = await this.get(
      params.ticker,
      ShareError.AddShareFailed,
    );

    if (share) {
      throw new BadRequestException(ShareError.ShareWithTickerAlreadyExists);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');

    try {
      const shareRepository: Repository<Share> =
        queryRunner.manager.getRepository(Share);
      const share: Share = new Share();
      share.accountId = companyId;
      share.name = params.name;
      share.ticker = params.ticker.toLowerCase();
      share.description = params.description;
      share.price = params.price;

      const savedShare: Share = await shareRepository.save(share);
      await this.shareOwnerService.add({
        accountId: companyId,
        shareId: savedShare.id,
        amount: params.wholeAmount,
        queryRunner,
      });

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(ShareError.AddShareFailed);
    }
  }

  public async getByTicker(ticker: string): Promise<IShare | null> {
    let share: Share | null = null;

    try {
      share = await this.shareRepository.findOne({
        where: {
          ticker: ticker.toLowerCase(),
        },
        relations: ['account'],
      });
    } catch {
      throw new BadRequestException(ShareError.GetByTickerFail);
    }

    if (!share) {
      throw new NotFoundException(ShareError.ShareNotFound);
    }

    return ShareHelper.transformShare(share);
  }

  public async sendOnStock(
    accountId: number,
    ticker: string,
    sendOnStockParams: SendOnStockDto,
  ): Promise<void> {
    await this.accountService.getAccount(
      accountId,
      ShareError.PriceUpdateFail,
      true,
    );
    const share: Share = await this.get(
      ticker,
      ShareError.SendOnStockFail,
      true,
    );

    let shareCountOnStock = 0;

    try {
      shareCountOnStock = await this.shareAvailableService.getSharesCount(
        share.id,
        accountId,
      );
    } catch {
      throw new BadRequestException(ShareError.SendOnStockFail);
    }

    const shareOwner: ShareOwner = await this.shareOwnerService.get(
      {
        accountId,
        shareId: share.id,
      },
      true,
    );

    if (shareOwner.amount - shareCountOnStock < sendOnStockParams.amount) {
      throw new BadRequestException(ShareError.NotEnoughShares);
    }

    try {
      await this.shareAvailableService.sendShareOnStock({
        accountId,
        shareId: share.id,
        ...sendOnStockParams,
      });
    } catch {
      throw new BadRequestException(ShareError.SendOnStockFail);
    }
  }

  public async get(
    ticker: string,
    errorMessage: string = ShareError.GetByTickerFail,
    exceptionIfNotFound = false,
  ): Promise<Share | null> {
    let share: Share | null = null;

    try {
      share = await this.shareRepository.findOne({
        where: {
          ticker: ticker.toLowerCase(),
        },
      });
    } catch {
      throw new BadRequestException(errorMessage);
    }

    if (!share && exceptionIfNotFound) {
      throw new NotFoundException(ShareError.ShareNotFound);
    }

    return share;
  }
}
