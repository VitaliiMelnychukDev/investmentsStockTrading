import { Account } from '../entities/account.entity';
import { IShortAccount } from '../types/account';

export class AccountHelper {
  public static getShortAccount(account: Account): IShortAccount {
    return {
      name: account.name,
      email: account.email,
    };
  }
}
