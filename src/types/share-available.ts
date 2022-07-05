import { ShareAvailable } from '../entities/share-available.entity';
import { IShare } from './share';
import { IShortAccount } from './account';

export type SendShareOnStock = Pick<
  ShareAvailable,
  'shareId' | 'accountId' | 'amount' | 'price'
>;

export interface IShareOnStock {
  id: number;
  share: IShare;
  ownerAccount: IShortAccount;
  amount: number;
  price: number;
}
