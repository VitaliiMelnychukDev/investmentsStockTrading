import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { ShareAvailableService } from '../services/share-available.service';
import { SearchDto } from '../dtos/shared/search.dto';
import { AuthNeeded } from '../decorators/auth.decorator';
import { IResponse, IResponseNoData } from '../types/general';
import { ShareAvailableMessage } from '../types/message';
import { IShareOnStock } from '../types/share-available';
import { IAuthorizedRequest } from '../types/request';
import { BuyDto } from '../dtos/share-available/buy.dto';

@Controller('share-on-stock')
export class ShareOnStockController {
  constructor(private shareAvailableService: ShareAvailableService) {}

  @Get('search')
  public async search(
    @Query(new ValidationPipe()) searchParams: SearchDto,
  ): Promise<IResponse<IShareOnStock[]>> {
    const sharesOnStock: IShareOnStock[] =
      await this.shareAvailableService.search(searchParams);

    return {
      data: sharesOnStock,
    };
  }

  @AuthNeeded()
  @Post(':id/buy')
  public async buy(
    @Body(new ValidationPipe()) buyParams: BuyDto,
    @Param('id') id: number,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.shareAvailableService.buy(
      request.account.accountId,
      id,
      buyParams,
    );

    return {
      success: true,
      message: ShareAvailableMessage.ShareBoughtAndWaitedOnPayment,
    };
  }

  @AuthNeeded()
  @Delete(':id')
  public async delete(
    @Param('id') id: number,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.shareAvailableService.delete(request.account.accountId, id);

    return {
      success: true,
      message: ShareAvailableMessage.ShareOnStockSuccessfullyDeleted,
    };
  }
}
