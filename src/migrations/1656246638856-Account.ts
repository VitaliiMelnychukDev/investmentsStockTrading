import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { accountRoles } from '../types/account';

export class Account1656246638856 implements MigrationInterface {
  public static idColumn = 'id';
  public static tableName = 'accounts';
  public static emailIndex = `index_${Account1656246638856.tableName}_email`;
  public static roleIndex = `index_${Account1656246638856.tableName}_role`;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const emailColumn = 'email';
    const roleColumn = 'role';

    await queryRunner.createTable(
      new Table({
        name: Account1656246638856.tableName,
        columns: [
          {
            name: Account1656246638856.idColumn,
            type: 'int',
            isPrimary: true,
          },
          {
            name: emailColumn,
            type: 'varchar',
            length: '256',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '256',
          },
          {
            name: roleColumn,
            type: 'enum',
            enum: accountRoles,
          },
          {
            name: 'cardNumber',
            type: 'varchar',
            length: '256',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'activated',
            type: 'boolean',
            default: false,
          },
        ],
      }),
    );

    const emailIndex = new TableIndex({
      name: Account1656246638856.emailIndex,
      columnNames: [emailColumn],
    });

    await queryRunner.createIndex(Account1656246638856.tableName, emailIndex);

    const roleIndex = new TableIndex({
      name: Account1656246638856.roleIndex,
      columnNames: [roleColumn],
    });

    await queryRunner.createIndex(Account1656246638856.tableName, roleIndex);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      Account1656246638856.tableName,
      Account1656246638856.roleIndex,
    );
    await queryRunner.dropIndex(
      Account1656246638856.tableName,
      Account1656246638856.emailIndex,
    );
    await queryRunner.dropTable(Account1656246638856.tableName);
  }
}
