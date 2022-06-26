import { SetMetadata } from '@nestjs/common';
import { AccountRole, rolesDecoratorKey } from '../types/account';

export const Roles = (...roles: AccountRole[]) =>
  SetMetadata(rolesDecoratorKey, roles);
