import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { AccountRole, accountRoles } from '../types/account';
import { Share } from './share.entity';
import { ShareOwner } from './share-owner.entity';
import { ShareAvailable } from './share-available.entity';
import { ShareProposal } from './share-proposal.entity';
import { Operation } from './operation.entity';

@Entity('accounts')
export class Account {
  @PrimaryColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 256,
    unique: true,
  })
  email: string;

  @Column({ type: 'varchar', length: 256 })
  name: string;

  @Column({
    type: 'enum',
    enum: accountRoles,
  })
  role: AccountRole;

  @Column({ type: 'varchar', length: 16, unique: true, default: null })
  cardNumber: string;

  @Column({ type: 'boolean', default: false })
  activated: boolean;

  @OneToMany(() => Share, (share: Share) => share.accountId)
  shares?: Share[];

  @OneToMany(() => ShareOwner, (shareOwner: ShareOwner) => shareOwner.accountId)
  shareOwners?: ShareOwner[];

  @OneToMany(
    () => ShareAvailable,
    (shareAccount: ShareAvailable) => shareAccount.accountId,
  )
  shareAvailableAccounts?: ShareAvailable[];

  @OneToMany(
    () => ShareProposal,
    (shareProposal: ShareProposal) => shareProposal.accountId,
  )
  shareProposalAccounts?: ShareProposal[];

  @OneToMany(() => Operation, (operation: Operation) => operation.sellerId)
  operationSellers?: Operation[];

  @OneToMany(() => Operation, (operation: Operation) => operation.buyerId)
  operationBuyers?: Operation[];
}
