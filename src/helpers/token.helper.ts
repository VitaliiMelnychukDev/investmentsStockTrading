export class TokenHelper {
  public static parseToken(authorizationHeader: string): string {
    return authorizationHeader.replace('Bearer', '').trim();
  }
}
