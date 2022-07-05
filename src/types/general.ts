import { Account } from '../entities/account.entity';
import {
  AccountMessage,
  ShareAvailableMessage,
  ShareMessage,
  ShareProposalMessage,
} from './message';
import { Share } from '../entities/share.entity';
import { ShareOwner } from '../entities/share-owner.entity';
import { ShareAvailable } from '../entities/share-available.entity';
import { ShareProposal } from '../entities/share-proposal.entity';
import { Operation } from '../entities/operation.entity';
import { QueryRunner } from 'typeorm';

type Message =
  | AccountMessage
  | ShareMessage
  | ShareAvailableMessage
  | ShareProposalMessage;

export interface IResponseNoData {
  success?: boolean;
  message?: Message;
}

export interface IResponse<T> extends IResponseNoData {
  data: T;
}

export const entitiesList = [
  Account,
  Share,
  ShareOwner,
  ShareAvailable,
  ShareProposal,
  Operation,
];

export type QueryRunnerOnly = {
  queryRunner?: QueryRunner;
};
