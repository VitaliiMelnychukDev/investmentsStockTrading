import { QueryRunner } from 'typeorm';
import { Operation } from '../entities/operation.entity';
import { QueryRunnerOnly } from './general';

export enum OperationStatus {
  PendingPayment = 'PendingPayment',
  Succeed = 'Succeed',
  Rejected = 'Rejected',
}

export const operationStatuses = [
  OperationStatus.PendingPayment,
  OperationStatus.Succeed,
  OperationStatus.Rejected,
];

export type GetOperation = QueryRunnerOnly & {
  id: number;
  error?: string;
};

export type UpdateStatus = QueryRunnerOnly & {
  id: number;
  newStatus: OperationStatus;
};

export type AddOperation = Pick<
  Operation,
  'sellerId' | 'buyerId' | 'shareId' | 'shareAvailableId' | 'price' | 'amount'
> &
  QueryRunnerOnly & {
    shareProposalId?: number;
  };
