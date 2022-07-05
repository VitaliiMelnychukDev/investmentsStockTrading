export enum Topic {
  Accounts = 'accounts',
  BankCardsToCheck = 'bank-cards-to-check',
  BankCardsCheckResponse = 'bank-cards-check-response',
  Transactions = 'transactions',
  TransactionsStatus = 'transactions-status',
}

export interface IBankCardsCheckResponse {
  accountId: number;
  cardNumber: string;
  valid: boolean;
}

export interface ITransactionStatus {
  transactionIdentifierId: number;
  succeed: boolean;
}

export const groupId = 'stock-trading-service';

export type acks = 1 | 0 | -1;
