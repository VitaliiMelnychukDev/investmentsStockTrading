import { AccountRole } from './account';

export type ITokenPayload = {
  accountId: number;
  email: string;
  role: AccountRole;
  name: string;
};
