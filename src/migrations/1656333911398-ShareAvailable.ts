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

export class ShareAvailable1656333911398 implements MigrationInterface {
  public static tableName = 'shareAvailable';
  public static idColumn = 'id';
  public static accountIdIndex = `index_${ShareAvailable1656333911398.tableName}_accountId`;
  public static shareIdIndex = `index_${ShareAvailable1656333911398.tableName}_shareId`;
  public static accountIdForeignKey = `foreign_key_${ShareAvailable1656333911398.tableName}_accountId`;
  public static shareIdForeignKey = `foreign_key_${ShareAvailable1656333911398.tableName}_shareId`;
  public static amountCheck = `check_${ShareAvailable1656333911398.tableName}_amount`;
  public static priceCheck = `check_${ShareAvailable1656333911398.tableName}_price`;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const shareIdColumn = 'shareId';
    const accountIdColumn = 'accountId';
    const amountColumn = 'amount';
    const priceColumn = 'price';

    await queryRunner.createTable(
      new Table({
        name: ShareAvailable1656333911398.tableName,
        columns: [
          {
            name: ShareAvailable1656333911398.idColumn,
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: shareIdColumn,
            type: 'int',
          },
          {
            name: accountIdColumn,
            type: 'int',
          },
          {
            name: amountColumn,
            type: 'int',
          },
          {
            name: 'marketPrice',
            type: 'boolean',
            default: true,
          },
          {
            name: priceColumn,
            type: 'float',
            isNullable: true,
          },
          {
            name: 'removed',
            type: 'boolean',
            default: false,
          },
        ],
      }),
    );

    const accountIdIndex = new TableIndex({
      name: ShareAvailable1656333911398.accountIdIndex,
      columnNames: [accountIdColumn],
    });

    await queryRunner.createIndex(
      ShareAvailable1656333911398.tableName,
      accountIdIndex,
    );

    const shareIdIndex = new TableIndex({
      name: ShareAvailable1656333911398.shareIdIndex,
      columnNames: [shareIdColumn],
    });

    await queryRunner.createIndex(
      ShareAvailable1656333911398.tableName,
      shareIdIndex,
    );

    const accountIdForeignKey = new TableForeignKey({
      name: ShareAvailable1656333911398.accountIdForeignKey,
      columnNames: [accountIdColumn],
      referencedColumnNames: [Account1656246638856.idColumn],
      referencedTableName: Account1656246638856.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      ShareAvailable1656333911398.tableName,
      accountIdForeignKey,
    );

    const shareIdForeignKey = new TableForeignKey({
      name: ShareAvailable1656333911398.shareIdForeignKey,
      columnNames: [shareIdColumn],
      referencedColumnNames: [Share1656331067356.idColumn],
      referencedTableName: Share1656331067356.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      ShareAvailable1656333911398.tableName,
      shareIdForeignKey,
    );

    const amountCheck = new TableCheck({
      name: ShareAvailable1656333911398.amountCheck,
      expression: `${amountColumn} >= 0`,
    });

    await queryRunner.createCheckConstraint(
      ShareAvailable1656333911398.tableName,
      amountCheck,
    );

    const priceCheck = new TableCheck({
      name: ShareAvailable1656333911398.priceCheck,
      expression: `${priceColumn} IS NULL OR ${priceColumn} > 0`,
    });

    await queryRunner.createCheckConstraint(
      ShareAvailable1656333911398.tableName,
      priceCheck,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropCheckConstraint(
      ShareAvailable1656333911398.tableName,
      ShareAvailable1656333911398.amountCheck,
    );

    await queryRunner.dropCheckConstraint(
      ShareAvailable1656333911398.tableName,
      ShareAvailable1656333911398.priceCheck,
    );

    await queryRunner.dropForeignKey(
      ShareAvailable1656333911398.tableName,
      ShareAvailable1656333911398.shareIdForeignKey,
    );

    await queryRunner.dropForeignKey(
      ShareAvailable1656333911398.tableName,
      ShareAvailable1656333911398.accountIdForeignKey,
    );

    await queryRunner.dropIndex(
      ShareAvailable1656333911398.tableName,
      ShareAvailable1656333911398.shareIdIndex,
    );

    await queryRunner.dropIndex(
      ShareAvailable1656333911398.tableName,
      ShareAvailable1656333911398.accountIdIndex,
    );
    await queryRunner.dropTable(ShareAvailable1656333911398.tableName);
  }
}
