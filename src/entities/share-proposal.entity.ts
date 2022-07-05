import {
  Check,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { Share } from './share.entity';
import { Operation } from './operation.entity';

@Entity('shareProposals')
@Check('`price` > 0')
@Check('`amount` >= 0')
export class ShareProposal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  accountId: number;

  @Column({ type: 'int' })
  shareId: number;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 256 })
  cardCode: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'bigint' })
  expiredAt: number;

  @Column({ type: 'boolean', default: false })
  removed: boolean;

  @ManyToOne(() => Account, (account: Account) => account.shareProposalAccounts)
  account?: Account;

  @ManyToOne(() => Share, (share: Share) => share.shareProposals)
  share?: Share;

  @OneToMany(
    () => Operation,
    (operation: Operation) => operation.shareProposalId,
  )
  operations?: Operation[];
}
