import { Share } from '../entities/share.entity';
import { IShortAccount } from './account';

export type IShare = Omit<Share, 'id' | 'accountId'> & {
  ownerAccount?: IShortAccount;
};
