import { Account } from '../entities/account.entity';

export enum AccountRole {
  Admin = 'admin',
  User = 'user',
  Bank = 'bank',
  Company = 'company',
}

export const accountRoles: AccountRole[] = [
  AccountRole.Admin,
  AccountRole.Bank,
  AccountRole.Company,
  AccountRole.User,
];

export const rolesDecoratorKey = 'roles';

export type IShortAccount = Pick<Account, 'email' | 'name'>;

export type AccountData = Pick<Account, 'email' | 'name' | 'id' | 'role'>;
