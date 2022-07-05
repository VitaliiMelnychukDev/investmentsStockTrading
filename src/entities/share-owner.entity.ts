import { Check, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Account } from './account.entity';
import { Share } from './share.entity';

@Entity('shareOwners')
@Check('`amount` >= 0')
export class ShareOwner {
  @PrimaryColumn({ type: 'int' })
  accountId: number;

  @PrimaryColumn({ type: 'int' })
  shareId: number;

  @Column({ type: 'int' })
  amount: number;

  @ManyToOne(() => Account, (account: Account) => account.shareOwners)
  account?: Account;

  @ManyToOne(() => Share, (share: Share) => share.shareOwners)
  share?: Share;
}
