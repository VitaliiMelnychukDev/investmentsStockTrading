import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { authDecoratorKey } from '../types/auth';
import { TokenService } from '../services/token.service';
import { TokenHelper } from '../helpers/token.helper';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: any = context.switchToHttp().getRequest();

    const authNeeded: boolean | undefined = this.reflector.get<
      boolean | undefined
    >(authDecoratorKey, context.getHandler());

    if (!authNeeded) {
      return true;
    }

    if (!request.headers) {
      this.userIsNotAuthorized();
    }

    const authorizationToken = request.headers.authorization;

    if (!authorizationToken) {
      this.userIsNotAuthorized();
    }

    try {
      const jwtToken: string = TokenHelper.parseToken(authorizationToken);
      request.account = this.tokenService.verifyAndGetAccessTokenData(jwtToken);

      return true;
    } catch {
      this.userIsNotAuthorized();
    }
  }

  private userIsNotAuthorized(): void {
    throw new UnauthorizedException();
  }
}
