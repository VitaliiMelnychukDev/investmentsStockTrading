import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { IResponse, IResponseNoData } from '../types/general';
import { AuthNeeded } from '../decorators/auth.decorator';
import { Roles } from '../decorators/roles.decorator';
import { AccountRole } from '../types/account';
import { CreateDto } from '../dtos/share/create.dto';
import { IAuthorizedRequest } from '../types/request';
import { ShareMessage } from '../types/message';
import { ShareService } from '../services/share.service';
import { SearchDto } from '../dtos/shared/search.dto';
import { ShareError } from '../types/error';
import { AddSharesDto } from '../dtos/share/add-shares.dto';
import { UpdatePriceDto } from '../dtos/share/update-price.dto';
import { IShareOwner } from '../types/share-owner';
import { IShare } from '../types/share';
import { SendOnStockDto } from '../dtos/share/send-on-stock.dto';
import { PaginationDto } from '../dtos/shared/pagination.dto';

@Controller('share')
export class ShareController {
  constructor(private shareService: ShareService) {}

  @Get('search')
  public async search(
    @Query(new ValidationPipe()) searchParams: SearchDto,
  ): Promise<IResponse<IShare[]>> {
    const shares: IShare[] = await this.shareService.search(searchParams);

    return {
      data: shares,
    };
  }

  @Get(':ticker')
  public async getByTicker(
    @Param('ticker') ticker: string,
  ): Promise<IResponse<IShare>> {
    const share: IShare | null = await this.shareService.getByTicker(ticker);

    if (!share) {
      throw new NotFoundException(ShareError.ShareNotFound);
    }

    return {
      data: share,
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.Company)
  @Post()
  public async create(
    @Body(new ValidationPipe()) createBody: CreateDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.shareService.create(request.account.accountId, createBody);

    return {
      success: true,
      message: ShareMessage.ShareSuccessfullyCreated,
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.Company)
  @Post(':ticker/add-shares')
  public async addShares(
    @Param('ticker') ticker: string,
    @Body(new ValidationPipe()) addSharesBody: AddSharesDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.shareService.addShares(
      request.account.accountId,
      ticker,
      addSharesBody.amount,
    );

    return {
      success: true,
      message: ShareMessage.SharesSuccessfullyAdded,
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.Company)
  @Patch(':ticker/update-price')
  public async updatePrice(
    @Param('ticker') ticker: string,
    @Body(new ValidationPipe())
    updatePriceBody: UpdatePriceDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.shareService.updatePrice(
      request.account.accountId,
      ticker,
      updatePriceBody.price,
    );

    return {
      success: true,
      message: ShareMessage.SharePriceUpdatedSuccessfully,
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.Company)
  @Get(':ticker/get-owners')
  public async getCompanyShares(
    @Param('ticker') ticker: string,
    @Query(new ValidationPipe()) paginationParams: PaginationDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<IShareOwner[]>> {
    const shareOwners: IShareOwner[] = await this.shareService.getOwners(
      request.account.accountId,
      ticker,
      paginationParams,
    );

    return {
      data: shareOwners,
    };
  }

  @AuthNeeded()
  @Post(':ticker/send-on-stock')
  public async sendOnStock(
    @Param('ticker') ticker: string,
    @Body(new ValidationPipe()) sendOnStockBody: SendOnStockDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.shareService.sendOnStock(
      request.account.accountId,
      ticker,
      sendOnStockBody,
    );

    return {
      success: true,
      message: ShareMessage.ShareSuccessfullySendOnStock,
    };
  }
}
