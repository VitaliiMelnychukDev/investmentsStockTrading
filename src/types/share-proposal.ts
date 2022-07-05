import { IShare } from './share';
import { IShortAccount } from './account';

export interface IShareProposal {
  id: number;
  share: IShare;
  ownerAccount: IShortAccount;
  amount: number;
  price: number;
  cardCode?: string;
}
