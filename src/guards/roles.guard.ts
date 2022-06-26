import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AccountRole, rolesDecoratorKey } from '../types/account';
import { ITokenPayload } from '../types/token';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: any = context.switchToHttp().getRequest();
    const roles: AccountRole[] = this.reflector.get<AccountRole[]>(
      rolesDecoratorKey,
      context.getHandler(),
    );
    if (!roles || !roles.length) {
      return true;
    }

    const account: ITokenPayload | undefined = request.account;

    return !(!account || !this.accountHasRole(account, roles));
  }

  private accountHasRole(
    account: ITokenPayload,
    acceptedRoles: AccountRole[],
  ): boolean {
    if (!account.role || !account.role.length) {
      return false;
    }

    return acceptedRoles.includes(account.role);
  }
}
