import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Operation } from '../entities/operation.entity';
import { Repository } from 'typeorm';
import {
  AddOperation,
  GetOperation,
  OperationStatus,
  UpdateStatus,
} from '../types/operation';
import { OperationError } from '../types/error';
import { QueryRunnerOnly } from '../types/general';

@Injectable()
export class OperationService {
  constructor(
    @InjectRepository(Operation)
    private operationRepository: Repository<Operation>,
  ) {}

  public async getSharesCount(
    shareId: number,
    accountId: number,
    status: OperationStatus,
  ): Promise<number> {
    try {
      const shareWaitingPaymentCount = await this.operationRepository
        .createQueryBuilder('operations')
        .select('sum("operations"."amount")', 'amount')
        .groupBy('"sellerId"')
        .addGroupBy('"shareId"')
        .addGroupBy('"status"')
        .having('shareAvailable.sellerId = :accountId', { accountId })
        .andHaving('shareAvailable.shareId = :shareId', { shareId })
        .andHaving('shareAvailable.status = :status', { status })
        .getRawOne<{ amount: number }>();

      return shareWaitingPaymentCount ? shareWaitingPaymentCount.amount : 0;
    } catch (e) {
      throw new BadRequestException(OperationError.GetSharesCountFail);
    }
  }

  public async get(params: GetOperation): Promise<Operation | null> {
    const repository = this.getRepository(params);
    const errorMessage = params.error || OperationError.GetOperationFail;

    try {
      return await repository.findOne({
        where: {
          id: params.id,
        },
        ...(params.queryRunner && { lock: { mode: 'for_no_key_update' } }),
      });
    } catch {
      throw new BadRequestException(errorMessage);
    }
  }

  async add(params: AddOperation): Promise<Operation> {
    const repository = this.getRepository(params);

    try {
      const newOperation = new Operation();
      newOperation.sellerId = params.sellerId;
      newOperation.buyerId = params.buyerId;
      newOperation.shareId = params.shareId;
      newOperation.shareAvailableId = params.shareAvailableId;

      if (params.shareProposalId) {
        newOperation.shareProposalId = params.shareProposalId;
      }

      newOperation.amount = params.amount;
      newOperation.price = params.price;
      newOperation.createdAt = new Date().getTime();
      newOperation.status = OperationStatus.PendingPayment;

      return await repository.save(newOperation);
    } catch {
      throw new BadRequestException(OperationError.AddOperationFail);
    }
  }

  public async updateStatus(params: UpdateStatus): Promise<void> {
    const repository = this.getRepository(params);

    try {
      await repository.update(
        {
          id: params.id,
        },
        { status: params.newStatus },
      );
    } catch {
      throw new BadRequestException(OperationError.UpdateOperationStatusFail);
    }
  }

  private getRepository(params: QueryRunnerOnly): Repository<Operation> {
    return params.queryRunner
      ? params.queryRunner.manager.getRepository(Operation)
      : this.operationRepository;
  }
}
