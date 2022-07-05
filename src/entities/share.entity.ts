import {
  Check,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { ShareOwner } from './share-owner.entity';
import { ShareAvailable } from './share-available.entity';
import { ShareProposal } from './share-proposal.entity';
import { Operation } from './operation.entity';

@Entity('shares')
@Check('`price` > 0')
export class Share {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  accountId: number;

  @Column({ type: 'varchar', length: 256 })
  name: string;

  @Column({ type: 'varchar', length: 256, unique: true })
  ticker: string;

  @Column({ type: 'varchar', default: '' })
  description: string;

  @Column({ type: 'float' })
  price: number;

  @ManyToOne(() => Account, (account: Account) => account.shares)
  account?: Account;

  @OneToMany(() => ShareOwner, (shareOwner: ShareOwner) => shareOwner.shareId)
  shareOwners?: ShareOwner[];

  @OneToMany(
    () => ShareAvailable,
    (shareAvailable: ShareAvailable) => shareAvailable.shareId,
  )
  shareAvailable?: ShareAvailable[];

  @OneToMany(
    () => ShareProposal,
    (shareProposal: ShareProposal) => shareProposal.shareId,
  )
  shareProposals?: ShareProposal[];

  @OneToMany(() => Operation, (operation: Operation) => operation.shareId)
  shareOperations?: Operation[];
}
