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

@Entity('shareAvailable')
@Check('`price` IS NOLL OR `price` > 0')
@Check('`amount` >= 0')
export class ShareAvailable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  accountId: number;

  @Column({ type: 'int' })
  shareId: number;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'boolean', default: true })
  marketPrice: boolean;

  @Column({ type: 'float', default: null })
  price: number;

  @Column({ type: 'boolean', default: false })
  removed: boolean;

  @ManyToOne(
    () => Account,
    (account: Account) => account.shareAvailableAccounts,
  )
  account?: Account;

  @ManyToOne(() => Share, (share: Share) => share.shareAvailable)
  share?: Share;

  @OneToMany(
    () => Operation,
    (operation: Operation) => operation.shareAvailableId,
  )
  operations?: Operation[];
}
