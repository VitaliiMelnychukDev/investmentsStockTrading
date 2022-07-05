import { Share } from '../entities/share.entity';
import { IShare } from '../types/share';
import { AccountHelper } from './account.helper';

export class ShareHelper {
  public static transformShare(share: Share, skipAccount = false): IShare {
    return {
      name: share.name,
      ticker: share.ticker,
      description: share.description,
      price: share.price,
      ...(!skipAccount && {
        ownerAccount: AccountHelper.getShortAccount(share.account),
      }),
    };
  }
}
