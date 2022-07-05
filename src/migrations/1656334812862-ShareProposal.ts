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

export class ShareProposal1656334812862 implements MigrationInterface {
  public static tableName = 'shareProposals';
  public static idColumn = 'id';
  public static accountIdIndex = `index_${ShareProposal1656334812862.tableName}_accountId`;
  public static shareIdIndex = `index_${ShareProposal1656334812862.tableName}_shareId`;
  public static accountIdForeignKey = `foreign_key_${ShareProposal1656334812862.tableName}_accountId`;
  public static shareIdForeignKey = `foreign_key_${ShareProposal1656334812862.tableName}_shareId`;
  public static amountCheck = `check_${ShareProposal1656334812862.tableName}_amount`;
  public static priceCheck = `check_${ShareProposal1656334812862.tableName}_price`;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const shareIdColumn = 'shareId';
    const accountIdColumn = 'accountId';
    const amountColumn = 'amount';
    const priceColumn = 'price';

    await queryRunner.createTable(
      new Table({
        name: ShareProposal1656334812862.tableName,
        columns: [
          {
            name: ShareProposal1656334812862.idColumn,
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
            name: 'cardCode',
            type: 'varchar',
            length: '256',
          },
          {
            name: priceColumn,
            type: 'float',
          },
          {
            name: 'expiredAt',
            type: 'bigint',
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
      name: ShareProposal1656334812862.accountIdIndex,
      columnNames: [accountIdColumn],
    });

    await queryRunner.createIndex(
      ShareProposal1656334812862.tableName,
      accountIdIndex,
    );

    const shareIdIndex = new TableIndex({
      name: ShareProposal1656334812862.shareIdIndex,
      columnNames: [shareIdColumn],
    });

    await queryRunner.createIndex(
      ShareProposal1656334812862.tableName,
      shareIdIndex,
    );

    const accountIdForeignKey = new TableForeignKey({
      name: ShareProposal1656334812862.accountIdForeignKey,
      columnNames: [accountIdColumn],
      referencedColumnNames: [Account1656246638856.idColumn],
      referencedTableName: Account1656246638856.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      ShareProposal1656334812862.tableName,
      accountIdForeignKey,
    );

    const shareIdForeignKey = new TableForeignKey({
      name: ShareProposal1656334812862.shareIdForeignKey,
      columnNames: [shareIdColumn],
      referencedColumnNames: [Share1656331067356.idColumn],
      referencedTableName: Share1656331067356.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      ShareProposal1656334812862.tableName,
      shareIdForeignKey,
    );

    const amountCheck = new TableCheck({
      name: ShareProposal1656334812862.amountCheck,
      expression: `${amountColumn} >= 0`,
    });

    await queryRunner.createCheckConstraint(
      ShareProposal1656334812862.tableName,
      amountCheck,
    );

    const priceCheck = new TableCheck({
      name: ShareProposal1656334812862.priceCheck,
      expression: `${priceColumn} > 0`,
    });

    await queryRunner.createCheckConstraint(
      ShareProposal1656334812862.tableName,
      priceCheck,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropCheckConstraint(
      ShareProposal1656334812862.tableName,
      ShareProposal1656334812862.amountCheck,
    );

    await queryRunner.dropCheckConstraint(
      ShareProposal1656334812862.tableName,
      ShareProposal1656334812862.priceCheck,
    );

    await queryRunner.dropForeignKey(
      ShareProposal1656334812862.tableName,
      ShareProposal1656334812862.shareIdForeignKey,
    );

    await queryRunner.dropForeignKey(
      ShareProposal1656334812862.tableName,
      ShareProposal1656334812862.accountIdForeignKey,
    );

    await queryRunner.dropIndex(
      ShareProposal1656334812862.tableName,
      ShareProposal1656334812862.shareIdIndex,
    );

    await queryRunner.dropIndex(
      ShareProposal1656334812862.tableName,
      ShareProposal1656334812862.accountIdIndex,
    );
    await queryRunner.dropTable(ShareProposal1656334812862.tableName);
  }
}
