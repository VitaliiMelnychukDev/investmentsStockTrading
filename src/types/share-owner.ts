import { QueryRunner } from 'typeorm';
import { IShare } from './share';
import { IShortAccount } from './account';

export interface IShareOwnerBase {
  shareId: number;

  accountId: number;

  queryRunner?: QueryRunner;
}

export interface IAddUpdateShareOwner extends IShareOwnerBase {
  amount: number;
}

export type IShareOwner = IShortAccount & {
  amount: number;
};

export type IAccountShare = IShare & {
  amount: number;
};
