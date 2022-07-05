import { ShareProposal } from '../entities/share-proposal.entity';
import { IShareProposal } from '../types/share-proposal';
import { IShare } from '../types/share';
import { ShareHelper } from './share.helper';
import { AccountHelper } from './account.helper';

export class ShareProposalsHelper {
  public static transform(
    shareProposal: ShareProposal,
    ownerAsk = false,
  ): IShareProposal {
    const share: IShare = ShareHelper.transformShare(shareProposal.share, true);

    return {
      share,
      id: shareProposal.id,
      amount: shareProposal.amount,
      price: shareProposal.price,
      ...(ownerAsk && { cardCode: shareProposal.cardCode }),
      ownerAccount: AccountHelper.getShortAccount(shareProposal.account),
    };
  }
}
