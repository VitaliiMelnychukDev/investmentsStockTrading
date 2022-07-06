import { ShareAvailable } from '../entities/share-available.entity';
import { IShare } from './share';
import { IShortAccount } from './account';
import { QueryRunnerOnly } from './general';

export type SendShareOnStock = QueryRunnerOnly &
  Pick<ShareAvailable, 'shareId' | 'accountId' | 'amount' | 'price'> & {
    removed?: boolean;
  };

export interface IShareOnStock {
  id: number;
  share: IShare;
  ownerAccount: IShortAccount;
  amount: number;
  price: number;
}
