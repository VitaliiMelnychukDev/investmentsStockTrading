import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import { Account1656246638856 } from './1656246638856-Account';
import { Share1656331067356 } from './1656331067356-Share';

export class ShareOwners1656332834432 implements MigrationInterface {
  public static tableName = 'shareOwners';
  public static accountIdIndex = `index_${ShareOwners1656332834432.tableName}_accountId`;
  public static shareIdIndex = `index_${ShareOwners1656332834432.tableName}_shareId`;
  public static accountIdForeignKey = `foreign_key_${ShareOwners1656332834432.tableName}_accountId`;
  public static shareIdForeignKey = `foreign_key_${ShareOwners1656332834432.tableName}_shareId`;
  public static amountCheck = `check_${ShareOwners1656332834432.tableName}_amount`;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const shareIdColumn = 'shareId';
    const accountIdColumn = 'accountId';
    const amountColumn = 'amount';

    await queryRunner.createTable(
      new Table({
        name: ShareOwners1656332834432.tableName,
        columns: [
          {
            name: shareIdColumn,
            type: 'int',
            isPrimary: true,
          },
          {
            name: accountIdColumn,
            type: 'int',
            isPrimary: true,
          },
          {
            name: amountColumn,
            type: 'int',
          },
        ],
      }),
    );

    const accountIdIndex = new TableIndex({
      name: ShareOwners1656332834432.accountIdIndex,
      columnNames: [accountIdColumn],
    });

    await queryRunner.createIndex(
      ShareOwners1656332834432.tableName,
      accountIdIndex,
    );

    const shareIdIndex = new TableIndex({
      name: ShareOwners1656332834432.shareIdIndex,
      columnNames: [shareIdColumn],
    });

    await queryRunner.createIndex(
      ShareOwners1656332834432.tableName,
      shareIdIndex,
    );

    const accountIdForeignKey = new TableForeignKey({
      name: ShareOwners1656332834432.accountIdForeignKey,
      columnNames: [accountIdColumn],
      referencedColumnNames: [Account1656246638856.idColumn],
      referencedTableName: Account1656246638856.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      ShareOwners1656332834432.tableName,
      accountIdForeignKey,
    );

    const shareIdForeignKey = new TableForeignKey({
      name: ShareOwners1656332834432.shareIdForeignKey,
      columnNames: [shareIdColumn],
      referencedColumnNames: [Share1656331067356.idColumn],
      referencedTableName: Share1656331067356.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      ShareOwners1656332834432.tableName,
      shareIdForeignKey,
    );

    const amountCheck = new TableCheck({
      name: ShareOwners1656332834432.amountCheck,
      expression: `${amountColumn} >= 0`,
    });

    await queryRunner.createCheckConstraint(
      ShareOwners1656332834432.tableName,
      amountCheck,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropCheckConstraint(
      ShareOwners1656332834432.tableName,
      ShareOwners1656332834432.amountCheck,
    );

    await queryRunner.dropForeignKey(
      ShareOwners1656332834432.tableName,
      ShareOwners1656332834432.shareIdForeignKey,
    );

    await queryRunner.dropForeignKey(
      ShareOwners1656332834432.tableName,
      ShareOwners1656332834432.accountIdForeignKey,
    );

    await queryRunner.dropIndex(
      ShareOwners1656332834432.tableName,
      ShareOwners1656332834432.shareIdIndex,
    );

    await queryRunner.dropIndex(
      ShareOwners1656332834432.tableName,
      ShareOwners1656332834432.accountIdIndex,
    );
    await queryRunner.dropTable(ShareOwners1656332834432.tableName);
  }
}
