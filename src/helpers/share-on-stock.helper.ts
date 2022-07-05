import { ShareAvailable } from '../entities/share-available.entity';
import { IShareOnStock } from '../types/share-available';
import { IShare } from '../types/share';
import { ShareHelper } from './share.helper';
import { AccountHelper } from './account.helper';

export class ShareOnStockHelper {
  public static transform(shareAvailable: ShareAvailable): IShareOnStock {
    const share: IShare = ShareHelper.transformShare(
      shareAvailable.share,
      true,
    );

    return {
      share,
      id: shareAvailable.id,
      amount: shareAvailable.amount,
      price: ShareOnStockHelper.getPrice(shareAvailable),
      ownerAccount: AccountHelper.getShortAccount(shareAvailable.account),
    };
  }

  public static getPrice(shareAvailable: ShareAvailable): number {
    return shareAvailable.price && !shareAvailable.marketPrice
      ? shareAvailable.price
      : shareAvailable.share.price;
  }
}
