import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShareOwner } from '../entities/share-owner.entity';
import { DataSource, Repository } from 'typeorm';
import {
  IAccountShare,
  IAddUpdateShareOwner,
  IShareOwner,
  IShareOwnerBase,
} from '../types/share-owner';
import { ShareAvailableError, ShareOwnerError } from '../types/error';
import { ShareHelper } from '../helpers/share.helper';
import { AccountHelper } from '../helpers/account.helper';
import { PaginationDto } from '../dtos/shared/pagination.dto';
import { PaginationService } from './pagination.service';
import { ConsumerService } from './consumer.service';
import { ITransactionStatus, Topic } from '../types/kafka';
import { ShareAvailableService } from './share-available.service';
import { Operation } from '../entities/operation.entity';
import { OperationStatus } from '../types/operation';
import { OperationService } from './operation.service';

@Injectable()
export class ShareOwnerService implements OnModuleInit {
  constructor(
    @InjectRepository(ShareOwner)
    private shareOwnerRepository: Repository<ShareOwner>,
    private paginationService: PaginationService,
    private consumerService: ConsumerService,
    private shareAvailableService: ShareAvailableService,
    private operationService: OperationService,
    private dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.consumerService.addConsumer(Topic.TransactionsStatus, {
      eachMessage: async ({ message }): Promise<void> => {
        const transactionStatusData: ITransactionStatus =
          this.consumerService.getMessageBody<ITransactionStatus>(message);

        if (transactionStatusData.succeed) {
          await this.onTransactionStatusSucceed(
            transactionStatusData.transactionIdentifierId,
          );
        } else {
          await this.shareAvailableService.onTransactionFailed(
            transactionStatusData.transactionIdentifierId,
          );
        }
      },
    });
  }

  private async onTransactionStatusSucceed(operationId: number): Promise<void> {
    let operation: Operation;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');

    try {
      operation = await this.operationService.get({
        id: operationId,
        queryRunner,
      });
    } catch {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(ShareOwnerError.OnTransactionSucceedFail);
    }

    if (!operation) return;

    let shareOwner: ShareOwner | null = null;

    try {
      shareOwner = await this.get({
        shareId: operation.shareId,
        accountId: operation.sellerId,
        queryRunner,
      });
    } catch {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(ShareOwnerError.OnTransactionSucceedFail);
    }

    if (!shareOwner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(
        ShareOwnerError.SucceedTransactionOwnerDidNotFound,
      );
    }

    if (shareOwner.amount < operation.amount) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(
        ShareOwnerError.SucceedTransactionOwnerAmountMismatch,
      );
    }

    let buyerOwner: ShareOwner | null = null;

    try {
      buyerOwner = await this.get({
        shareId: operation.shareId,
        accountId: operation.buyerId,
        queryRunner,
      });
    } catch {
      await queryRunner.release();
      await queryRunner.rollbackTransaction();

      throw new BadRequestException(ShareOwnerError.OnTransactionSucceedFail);
    }

    try {
      await queryRunner.manager.getRepository(ShareOwner).update(
        {
          shareId: operation.shareId,
          accountId: operation.sellerId,
        },
        {
          amount: shareOwner.amount - operation.amount,
        },
      );

      const buyerOwnerBase: IShareOwnerBase = {
        accountId: operation.buyerId,
        shareId: operation.shareId,
        queryRunner,
      };

      if (buyerOwner) {
        await this.update({
          ...buyerOwnerBase,
          amount: buyerOwner.amount + operation.amount,
        });
      } else {
        await this.add({
          ...buyerOwnerBase,
          amount: operation.amount,
        });
      }

      await this.operationService.updateStatus({
        id: operationId,
        newStatus: OperationStatus.Succeed,
        queryRunner,
      });

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch {
      await queryRunner.release();
      await queryRunner.rollbackTransaction();

      throw new BadRequestException(ShareAvailableError.OnTransactionFail);
    }
  }

  public async getOwners(
    shareId: number,
    paginationParams: PaginationDto,
  ): Promise<IShareOwner[]> {
    try {
      const shareOwners: ShareOwner[] = await this.shareOwnerRepository.find({
        ...this.paginationService.getPaginationParams(paginationParams),
        where: {
          shareId,
        },
        relations: ['account'],
      });

      return shareOwners.map((shareOwner: ShareOwner) => {
        return {
          ...AccountHelper.getShortAccount(shareOwner.account),
          amount: shareOwner.amount,
        };
      });
    } catch {
      throw new BadRequestException(ShareOwnerError.GetShareOwnersFail);
    }
  }

  public async getShares(
    accountId: number,
    paginationParams: PaginationDto,
  ): Promise<IAccountShare[]> {
    try {
      const shareOwners: ShareOwner[] = await this.shareOwnerRepository.find({
        ...this.paginationService.getPaginationParams(paginationParams),
        where: {
          accountId,
        },
        relations: ['share', 'share.account'],
      });

      return shareOwners.map((shareOwner: ShareOwner) => {
        return {
          ...ShareHelper.transformShare(shareOwner.share),
          amount: shareOwner.amount,
        };
      });
    } catch {
      throw new BadRequestException(ShareOwnerError.GetAccountSharesFail);
    }
  }

  public async add(params: IAddUpdateShareOwner): Promise<void> {
    const repository: Repository<ShareOwner> = this.getRepository(params);

    try {
      const shareOwner = new ShareOwner();
      shareOwner.shareId = params.shareId;
      shareOwner.accountId = params.accountId;
      shareOwner.amount = params.amount;

      await repository.save(shareOwner);
    } catch {
      throw new BadRequestException(ShareOwnerError.AddShareOwnerFailed);
    }
  }

  public async get(
    params: IShareOwnerBase,
    throwIfNotFound = false,
  ): Promise<ShareOwner | null> {
    const repository: Repository<ShareOwner> = this.getRepository(params);

    let shareOwner: ShareOwner | null = null;

    try {
      shareOwner = await repository.findOne({
        where: {
          accountId: params.accountId,
          shareId: params.shareId,
        },
        ...(params.queryRunner && { lock: { mode: 'for_no_key_update' } }),
      });
    } catch {
      throw new BadRequestException(ShareOwnerError.GetShareOwnerFailed);
    }

    if (!shareOwner && throwIfNotFound) {
      throw new BadRequestException(ShareOwnerError.OwnerSharesNotFound);
    }

    return shareOwner;
  }

  public async update(params: IAddUpdateShareOwner): Promise<void> {
    const repository: Repository<ShareOwner> = this.getRepository(params);

    try {
      await repository.update(
        {
          accountId: params.accountId,
          shareId: params.shareId,
        },
        {
          amount: params.amount,
        },
      );
    } catch {
      throw new BadRequestException(ShareOwnerError.UpdateShareOwnerFailed);
    }
  }

  private getRepository(params: IShareOwnerBase): Repository<ShareOwner> {
    return params.queryRunner
      ? params.queryRunner.manager.getRepository(ShareOwner)
      : this.shareOwnerRepository;
  }
}
