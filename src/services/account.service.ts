import { AddAccountDto } from '../dtos/account/add.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { AccountError } from '../types/error';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}
  public async addAccount(account: AddAccountDto): Promise<void> {
    let existedAccount: Account | null = null;

    try {
      existedAccount = await this.accountRepository.findOne({
        where: [
          {
            id: account.accountId,
          },
          {
            email: account.email,
          },
        ],
      });
    } catch {
      throw new BadRequestException(AccountError.AddAccountFail);
    }

    if (existedAccount) {
      throw new BadRequestException(AccountError.AccountAlreadyExists);
    }

    const newAccount = new Account();
    newAccount.id = account.accountId;
    newAccount.email = account.email;
    newAccount.name = account.name;
    newAccount.role = account.role;
    newAccount.cardNumber = null;
    newAccount.activated = false;

    try {
      await this.accountRepository.save(newAccount);
    } catch {
      throw new BadRequestException(AccountError.AddAccountFail);
    }
  }

  public async updateCard(
    accountId: number,
    cardNumber: string,
  ): Promise<void> {
    try {
      await this.accountRepository.update(
        { id: accountId },
        { cardNumber, activated: false },
      );
    } catch {
      throw new BadRequestException(AccountError.UpdateCardNumberFail);
    }
    await this.getAccount(accountId, AccountError.UpdateCardNumberFail);
  }

  public async getAccount(id: number, errorMessage: string): Promise<Account> {
    let account: Account | null = null;

    try {
      account = await this.accountRepository.findOne({
        where: {
          id,
        },
      });
    } catch {
      throw new BadRequestException(errorMessage);
    }

    if (!account) {
      throw new BadRequestException(errorMessage);
    }

    return account;
  }
}
