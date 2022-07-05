import {
  Check,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OperationStatus, operationStatuses } from '../types/operation';
import { Account } from './account.entity';
import { Share } from './share.entity';
import { ShareAvailable } from './share-available.entity';
import { ShareProposal } from './share-proposal.entity';

@Entity('operations')
@Check('`price` > 0')
@Check('`amount` > 0')
export class Operation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  sellerId: number;

  @Column({ type: 'int' })
  buyerId: number;

  @Column({ type: 'int' })
  shareId: number;

  @Column({ type: 'int' })
  shareAvailableId: number;

  @Column({ type: 'int', default: null })
  shareProposalId: number;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'bigint', default: new Date().getTime() })
  createdAt: number;

  @Column({ type: 'varchar', length: 256, default: null })
  message: string;

  @Column({
    type: 'enum',
    enum: operationStatuses,
    default: OperationStatus.PendingPayment,
  })
  status: OperationStatus;

  @ManyToOne(() => Account, (account: Account) => account.operationSellers)
  seller?: Account;

  @ManyToOne(() => Account, (account: Account) => account.operationBuyers)
  buyer?: Account;

  @ManyToOne(() => Share, (share: Share) => share.shareOperations)
  share?: Share;

  @ManyToOne(
    () => ShareAvailable,
    (shareAvailable: ShareAvailable) => shareAvailable.operations,
  )
  shareAvailable?: ShareAvailable;

  @ManyToOne(
    () => ShareProposal,
    (shareProposal: ShareProposal) => shareProposal.operations,
  )
  shareProposal?: ShareProposal;
}
