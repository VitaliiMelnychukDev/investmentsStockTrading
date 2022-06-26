import { AccountRole, accountRoles } from '../../types/account';
import { IsEmail, IsIn, IsNumber, Length } from 'class-validator';

export class AddAccountDto {
  @IsNumber()
  accountId: number;

  @IsEmail()
  email: string;

  @Length(2, 100)
  name: string;

  @IsIn(accountRoles)
  role: AccountRole;
}
