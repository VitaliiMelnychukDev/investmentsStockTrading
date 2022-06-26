import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AccountRole, accountRoles } from '../types/account';

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
}
