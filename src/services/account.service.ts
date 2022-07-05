import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { AccountError } from '../types/error';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountData } from '../types/account';
import { ConsumerService } from './consumer.service';
import { IBankCardsCheckResponse, Topic } from '../types/kafka';
import { ProducerService } from './producer.service';

@Injectable()
export class AccountService implements OnModuleInit {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private consumerService: ConsumerService,
    private producerService: ProducerService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.consumerService.addConsumer(Topic.Accounts, {
      eachMessage: async ({ message }): Promise<void> => {
        const accountData: AccountData =
          this.consumerService.getMessageBody<AccountData>(message);
        await this.addAccount(accountData);
      },
    });

    await this.consumerService.addConsumer(Topic.BankCardsCheckResponse, {
      eachMessage: async ({ message }): Promise<void> => {
        try {
          const bankCardsCheckResponse: IBankCardsCheckResponse =
            this.consumerService.getMessageBody<IBankCardsCheckResponse>(
              message,
            );

          const account: Account = await this.getAccount(
            bankCardsCheckResponse.accountId,
            AccountError.AccountWasNotFound,
          );

          if (
            bankCardsCheckResponse.valid &&
            account.cardNumber === bankCardsCheckResponse.cardNumber
          ) {
            await this.accountRepository.update(
              {
                id: account.id,
              },
              {
                activated: true,
              },
            );
          }
        } catch {
          console.log('Bank check card check response failed: ');
        }
      },
    });
  }

  public async addAccount(account: AccountData): Promise<void> {
    let existedAccount: Account | null = null;

    try {
      existedAccount = await this.accountRepository.findOne({
        where: [
          {
            id: account.id,
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
    newAccount.id = account.id;
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
      await this.producerService.sendMessage(
        Topic.BankCardsToCheck,
        accountId,
        {
          accountId,
          cardNumber,
        },
      );
    } catch (e) {
      throw new BadRequestException(AccountError.UpdateCardNumberFail);
    }
  }

  public async getAccount(
    id: number,
    errorMessage: string,
    throwIfNotActivated = false,
  ): Promise<Account> {
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

    if (throwIfNotActivated && !account.activated) {
      throw new BadRequestException(AccountError.AccountIsNotActivated);
    }

    return account;
  }
}
