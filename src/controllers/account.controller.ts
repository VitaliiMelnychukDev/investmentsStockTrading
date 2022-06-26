import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { AddAccountDto } from '../dtos/account/add.dto';
import { AccountService } from '../services/account.service';
import { AuthNeeded } from '../decorators/auth.decorator';
import { UpdateCardNumberDto } from '../dtos/account/update-card-number.dto';
import { IAuthorizedRequest } from '../types/request';
import { IResponseNoData } from '../types/general';
import { AccountMessage } from '../types/message';

@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('add')
  public async add(
    @Body(new ValidationPipe()) addBody: AddAccountDto,
  ): Promise<void> {
    await this.accountService.addAccount(addBody);
  }

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
}
