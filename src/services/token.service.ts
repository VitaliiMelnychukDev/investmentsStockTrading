import * as jwt from 'jsonwebtoken';
import { TokenError } from '../types/error';
import { ITokenPayload } from '../types/token';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TokenService {
  private readonly secret = 'Test';
  private readonly jwtAlgorithm = 'HS256';

  public verifyAndGetAccessTokenData(token: string): ITokenPayload {
    try {
      return jwt.verify(token, this.secret, {
        algorithms: [this.jwtAlgorithm],
      }) as ITokenPayload;
    } catch (e) {
      throw new UnauthorizedException(TokenError.TokenIsNotValid);
    }
  }
}
