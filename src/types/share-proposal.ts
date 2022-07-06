import { IShare } from './share';
import { IShortAccount } from './account';
import { QueryRunnerOnly } from './general';

export interface IShareProposal {
  id: number;
  share: IShare;
  ownerAccount: IShortAccount;
  amount: number;
  price: number;
  cardCode?: string;
}

export type IGetShareProposal = QueryRunnerOnly & {
  id: number;
  error: string;
  throwIfNotFound?: boolean;
};
