import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import { operationStatuses } from '../types/operation';
import { Share1656331067356 } from './1656331067356-Share';
import { Account1656246638856 } from './1656246638856-Account';
import { ShareProposal1656334812862 } from './1656334812862-ShareProposal';
import { ShareAvailable1656333911398 } from './1656333911398-ShareAvailable';

export class Operations1656956791521 implements MigrationInterface {
  public static tableName = 'operations';
  public static sellerIdIndex = `index_${Operations1656956791521.tableName}_sellerId`;
  public static buyerIdIndex = `index_${Operations1656956791521.tableName}_buyerId`;
  public static shareAvailableIdIndex = `index_${Operations1656956791521.tableName}_shareAvailableId`;
  public static shareProposalIdIndex = `index_${Operations1656956791521.tableName}_shareProposalId`;
  public static sellerIdForeignKey = `foreign_key_${Operations1656956791521.tableName}_sellerId`;
  public static buyerIdForeignKey = `foreign_key_${Operations1656956791521.tableName}_buyerId`;
  public static shareIdForeignKey = `foreign_key_${Operations1656956791521.tableName}_shareId`;
  public static shareAvailableIdForeignKey = `foreign_key_${Operations1656956791521.tableName}_shareAvailableId`;
  public static shareProposalIdForeignKey = `foreign_key_${Operations1656956791521.tableName}_shareProposalId`;
  public static amountCheck = `check_${Operations1656956791521.tableName}_amount`;
  public static priceCheck = `check_${Operations1656956791521.tableName}_price`;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const sellerIdColumn = 'sellerId';
    const buyerIdColumn = 'buyerId';
    const shareIdColumn = 'shareId';
    const shareAvailableIdColumn = 'shareAvailableId';
    const shareProposalIdColumn = 'shareProposalId';
    const amountColumn = 'amount';
    const priceColumn = 'price';

    await queryRunner.createTable(
      new Table({
        name: Operations1656956791521.tableName,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: sellerIdColumn,
            type: 'int',
          },
          {
            name: buyerIdColumn,
            type: 'int',
          },
          {
            name: shareIdColumn,
            type: 'int',
          },
          {
            name: shareAvailableIdColumn,
            type: 'int',
          },
          {
            name: shareProposalIdColumn,
            type: 'int',
            isNullable: true,
          },
          {
            name: priceColumn,
            type: 'float',
          },
          {
            name: amountColumn,
            type: 'int',
          },
          {
            name: 'createdAt',
            type: 'bigint',
          },
          {
            name: 'message',
            type: 'varchar',
            length: '256',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: operationStatuses,
          },
        ],
      }),
    );

    const sellerIdIndex = new TableIndex({
      name: Operations1656956791521.sellerIdIndex,
      columnNames: [sellerIdColumn],
    });

    await queryRunner.createIndex(
      Operations1656956791521.tableName,
      sellerIdIndex,
    );

    const buyerIdIndex = new TableIndex({
      name: Operations1656956791521.buyerIdIndex,
      columnNames: [buyerIdColumn],
    });

    await queryRunner.createIndex(
      Operations1656956791521.tableName,
      buyerIdIndex,
    );

    const shareAvailableIdIndex = new TableIndex({
      name: Operations1656956791521.shareAvailableIdIndex,
      columnNames: [shareAvailableIdColumn],
    });

    await queryRunner.createIndex(
      Operations1656956791521.tableName,
      shareAvailableIdIndex,
    );

    const shareProposalIdIndex = new TableIndex({
      name: Operations1656956791521.shareProposalIdIndex,
      columnNames: [shareProposalIdColumn],
    });

    await queryRunner.createIndex(
      Operations1656956791521.tableName,
      shareProposalIdIndex,
    );

    const sellerIdForeignKey = new TableForeignKey({
      name: Operations1656956791521.sellerIdForeignKey,
      columnNames: [sellerIdColumn],
      referencedColumnNames: [Account1656246638856.idColumn],
      referencedTableName: Account1656246638856.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      Operations1656956791521.tableName,
      sellerIdForeignKey,
    );

    const buyerIdForeignKey = new TableForeignKey({
      name: Operations1656956791521.buyerIdForeignKey,
      columnNames: [buyerIdColumn],
      referencedColumnNames: [Account1656246638856.idColumn],
      referencedTableName: Account1656246638856.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      Operations1656956791521.tableName,
      buyerIdForeignKey,
    );

    const shareIdForeignKey = new TableForeignKey({
      name: Operations1656956791521.shareIdForeignKey,
      columnNames: [shareIdColumn],
      referencedColumnNames: [Share1656331067356.idColumn],
      referencedTableName: Share1656331067356.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      Operations1656956791521.tableName,
      shareIdForeignKey,
    );

    const shareAvailableIdForeignKey = new TableForeignKey({
      name: Operations1656956791521.shareAvailableIdForeignKey,
      columnNames: [shareAvailableIdColumn],
      referencedColumnNames: [ShareAvailable1656333911398.idColumn],
      referencedTableName: ShareAvailable1656333911398.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      Operations1656956791521.tableName,
      shareAvailableIdForeignKey,
    );

    const shareProposalIdForeignKey = new TableForeignKey({
      name: Operations1656956791521.shareProposalIdForeignKey,
      columnNames: [shareProposalIdColumn],
      referencedColumnNames: [ShareProposal1656334812862.idColumn],
      referencedTableName: ShareProposal1656334812862.tableName,
      onDelete: 'RESTRICT',
    });

    await queryRunner.createForeignKey(
      Operations1656956791521.tableName,
      shareProposalIdForeignKey,
    );

    const amountCheck = new TableCheck({
      name: Operations1656956791521.amountCheck,
      expression: `${amountColumn} > 0`,
    });

    await queryRunner.createCheckConstraint(
      Operations1656956791521.tableName,
      amountCheck,
    );

    const priceCheck = new TableCheck({
      name: Operations1656956791521.priceCheck,
      expression: `${priceColumn} > 0`,
    });

    await queryRunner.createCheckConstraint(
      Operations1656956791521.tableName,
      priceCheck,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropCheckConstraint(
      Operations1656956791521.tableName,
      Operations1656956791521.amountCheck,
    );
    await queryRunner.dropCheckConstraint(
      Operations1656956791521.tableName,
      Operations1656956791521.priceCheck,
    );
    await queryRunner.dropForeignKey(
      Operations1656956791521.tableName,
      Operations1656956791521.shareProposalIdForeignKey,
    );
    await queryRunner.dropForeignKey(
      Operations1656956791521.tableName,
      Operations1656956791521.shareAvailableIdForeignKey,
    );
    await queryRunner.dropForeignKey(
      Operations1656956791521.tableName,
      Operations1656956791521.shareIdForeignKey,
    );
    await queryRunner.dropForeignKey(
      Operations1656956791521.tableName,
      Operations1656956791521.buyerIdForeignKey,
    );
    await queryRunner.dropForeignKey(
      Operations1656956791521.tableName,
      Operations1656956791521.sellerIdForeignKey,
    );
    await queryRunner.dropIndex(
      Operations1656956791521.tableName,
      Operations1656956791521.shareProposalIdIndex,
    );
    await queryRunner.dropIndex(
      Operations1656956791521.tableName,
      Operations1656956791521.shareAvailableIdIndex,
    );
    await queryRunner.dropIndex(
      Operations1656956791521.tableName,
      Operations1656956791521.buyerIdIndex,
    );
    await queryRunner.dropIndex(
      Operations1656956791521.tableName,
      Operations1656956791521.sellerIdIndex,
    );
    await queryRunner.dropTable(Operations1656956791521.tableName);
  }
}
