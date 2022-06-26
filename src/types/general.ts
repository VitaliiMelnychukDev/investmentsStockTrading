import { Account } from '../entities/account.entity';
import { AccountMessage } from './message';

type Message = AccountMessage;

export interface IResponseNoData {
  success?: boolean;
  message?: Message;
}

export interface IResponse<T> extends IResponseNoData {
  data: T;
}

export const entitiesList = [Account];
