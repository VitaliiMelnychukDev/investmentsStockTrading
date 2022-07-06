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
import { ShareProposalService } from '../services/share-proposal.service';
import { AuthNeeded } from '../decorators/auth.decorator';
import { AddDto } from '../dtos/share-proposal/add.dto';
import { IAuthorizedRequest } from '../types/request';
import { IResponse, IResponseNoData } from '../types/general';
import { ShareProposalMessage } from '../types/message';
import { SearchDto } from '../dtos/shared/search.dto';
import { IShareProposal } from '../types/share-proposal';
import { TakeProposalDto } from '../dtos/share-proposal/take-proposal.dto.';

@Controller('share-proposal')
export class ShareProposalController {
  constructor(private shareProposalService: ShareProposalService) {}

  @Get('search')
  public async search(
    @Query(new ValidationPipe()) searchParams: SearchDto,
  ): Promise<IResponse<IShareProposal[]>> {
    const sharesOnStock: IShareProposal[] =
      await this.shareProposalService.search(searchParams);

    return {
      data: sharesOnStock,
    };
  }

  @AuthNeeded()
  @Post()
  public async create(
    @Body(new ValidationPipe()) addParams: AddDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.shareProposalService.create(
      request.account.accountId,
      addParams,
    );

    return {
      success: true,
      message: ShareProposalMessage.ShareProposalSuccessfullyCreated,
    };
  }

  @AuthNeeded()
  @Delete(':id')
  public async delete(
    @Param('id') id: number,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.shareProposalService.delete(request.account.accountId, id);

    return {
      success: true,
      message: ShareProposalMessage.ShareProposalSuccessfullyDeleted,
    };
  }

  @AuthNeeded()
  @Post(':id/take-proposal')
  public async takeProposal(
    @Param('id') id: number,
    @Req() request: IAuthorizedRequest,
    @Body(new ValidationPipe()) takeProposalBody: TakeProposalDto,
  ): Promise<IResponseNoData> {
    await this.shareProposalService.takeProposal(
      request.account.accountId,
      id,
      takeProposalBody.amount,
    );

    return {
      success: true,
      message: ShareProposalMessage.TakeProposalSuccess,
    };
  }
}
