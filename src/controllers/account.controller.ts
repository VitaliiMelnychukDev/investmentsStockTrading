import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { AccountService } from '../services/account.service';
import { AuthNeeded } from '../decorators/auth.decorator';
import { UpdateCardNumberDto } from '../dtos/account/update-card-number.dto';
import { IAuthorizedRequest } from '../types/request';
import { IResponse, IResponseNoData } from '../types/general';
import { AccountMessage } from '../types/message';
import { Roles } from '../decorators/roles.decorator';
import { AccountRole } from '../types/account';
import { Share } from '../entities/share.entity';
import { ShareService } from '../services/share.service';
import { IAccountShare } from '../types/share-owner';
import { ShareOwnerService } from '../services/share-owner.service';
import { PaginationDto } from '../dtos/shared/pagination.dto';
import { ShareAvailableService } from '../services/share-available.service';
import { SearchDto } from '../dtos/shared/search.dto';
import { IShareOnStock } from '../types/share-available';
import { ShareProposalService } from '../services/share-proposal.service';
import { IShareProposal } from '../types/share-proposal';

@Controller('account')
export class AccountController {
  constructor(
    private accountService: AccountService,
    private shareService: ShareService,
    private shareOwnerService: ShareOwnerService,
    private shareAvailableService: ShareAvailableService,
    private shareProposalService: ShareProposalService,
  ) {}

  @AuthNeeded()
  @Patch('update-card-number')
  public async updateCardNumber(
    @Body(new ValidationPipe()) updateCardNumberBody: UpdateCardNumberDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponseNoData> {
    await this.accountService.updateCard(
      request.account.accountId,
      updateCardNumberBody.cardNumber,
    );

    return {
      success: true,
      message: AccountMessage.CardNumberSuccessfullyUpdated,
    };
  }

  @AuthNeeded()
  @Roles(AccountRole.Company)
  @Get('company-shares')
  public async getCompanyShares(
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<Share[]>> {
    const shares: Share[] = await this.shareService.getCompanyShares(
      request.account.accountId,
    );

    return {
      data: shares,
    };
  }

  @AuthNeeded()
  @Get('shares')
  public async getShares(
    @Query(new ValidationPipe()) paginationDto: PaginationDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<IAccountShare[]>> {
    const accountShares: IAccountShare[] =
      await this.shareOwnerService.getShares(
        request.account.accountId,
        paginationDto,
      );

    return {
      data: accountShares,
    };
  }

  @AuthNeeded()
  @Get('shares-on-stock')
  public async getSharesOnStock(
    @Query(new ValidationPipe()) searchDto: SearchDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<IShareOnStock[]>> {
    const shareOnStock: IShareOnStock[] =
      await this.shareAvailableService.search(
        searchDto,
        request.account.accountId,
      );

    return {
      data: shareOnStock,
    };
  }

  @AuthNeeded()
  @Get('shares-proposals')
  public async getShareProposals(
    @Query(new ValidationPipe()) searchDto: SearchDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<IResponse<IShareProposal[]>> {
    const shareProposals: IShareProposal[] =
      await this.shareProposalService.search(
        searchDto,
        request.account.accountId,
      );

    return {
      data: shareProposals,
    };
  }
}
