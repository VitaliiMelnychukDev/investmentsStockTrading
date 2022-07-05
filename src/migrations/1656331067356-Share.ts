import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import { Account1656246638856 } from './1656246638856-Account';

export class Share1656331067356 implements MigrationInterface {
  public static idColumn = 'id';
  public static tableName = 'shares';
  public static accountIdIndex = `index_${Share1656331067356.tableName}_accountId`;
  public static tickerIndex = `index_${Share1656331067356.tableName}_ticker`;
  public static accountIdForeignKey = `foreign_key_${Share1656331067356.tableName}_accountId`;
  public static priceCheck = `check_${Share1656331067356.tableName}_price`;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const accountIdColumn = 'accountId';
    const tickerColumn = 'ticker';
    const priceColumn = 'price';

    await queryRunner.createTable(
      new Table({
        name: Share1656331067356.tableName,
        columns: [
          {
            name: Share1656331067356.idColumn,
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: accountIdColumn,
            type: 'int',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '256',
          },
          {
            name: tickerColumn,
            type: 'varchar',
            length: '256',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: priceColumn,
            type: 'float',
          },
        ],
      }),
    );

    const tickerIndex = new TableIndex({
      name: Share1656331067356.tickerIndex,
      columnNames: [tickerColumn],
    });

    await queryRunner.createIndex(Share1656331067356.tableName, tickerIndex);

    const accountIdIndex = new TableIndex({
      name: Share1656331067356.accountIdIndex,
      columnNames: [accountIdColumn],
    });

    await queryRunner.createIndex(Share1656331067356.tableName, accountIdIndex);

    const accountIdForeignKey = new TableForeignKey({
      name: Share1656331067356.accountIdForeignKey,
      columnNames: [accountIdColumn],
      referencedColumnNames: [Account1656246638856.idColumn],
      referencedTableName: Account1656246638856.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      Share1656331067356.tableName,
      accountIdForeignKey,
    );

    const marketPriceCheck = new TableCheck({
      name: Share1656331067356.priceCheck,
      expression: `${priceColumn} > 0`,
    });

    await queryRunner.createCheckConstraint(
      Share1656331067356.tableName,
      marketPriceCheck,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropCheckConstraint(
      Share1656331067356.tableName,
      Share1656331067356.priceCheck,
    );

    await queryRunner.dropForeignKey(
      Share1656331067356.tableName,
      Share1656331067356.accountIdForeignKey,
    );

    await queryRunner.dropIndex(
      Share1656331067356.tableName,
      Share1656331067356.accountIdIndex,
    );

    await queryRunner.dropIndex(
      Share1656331067356.tableName,
      Share1656331067356.tickerIndex,
    );
    await queryRunner.dropTable(Share1656331067356.tableName);
  }
}
