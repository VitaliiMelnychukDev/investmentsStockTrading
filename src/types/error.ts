export enum TokenError {
  TokenIsNotValid = 'TokenIsNotValid',
}

export enum AccountError {
  AddAccountFail = 'AddAccountFail',
  AccountAlreadyExists = 'AccountAlreadyExists',
  UpdateCardNumberFail = 'UpdateCardNumberFail',
  AccountWasNotFound = 'AccountWasNotFound',
  AccountIsNotActivated = 'AccountIsNotActivated',
}

export enum ShareError {
  AddShareFailed = 'AddShareFailed',
  OnlyCompanyCanAddShare = 'OnlyCompanyCanAddShare',
  ShareWithTickerAlreadyExists = 'ShareWithTickerAlreadyExists',
  SearchSharesFail = 'SearchSharesFail',
  GetByTickerFail = 'GetByTickerFail',
  ShareNotFound = 'ShareNotFound',
  SharesAddFail = 'SharesAddFail',
  PriceUpdateFail = 'PriceUpdateFail',
  GetCompanySharesFail = 'GetCompanySharesFail',
  SendOnStockFail = 'SendOnStockFail',
  NotEnoughShares = 'NotEnoughShares',
}

export enum ShareOwnerError {
  AddShareOwnerFailed = 'AddShareOwnerFailed',
  GetShareOwnerFailed = 'GetShareOwnerFailed',
  OwnerSharesNotFound = 'OwnerSharesNotFound',
  UpdateShareOwnerFailed = 'UpdateShareOwnerFailed',
  GetShareOwnersFail = 'GetShareOwnersFail',
  GetAccountSharesFail = 'GetAccountSharesFail',
  OnTransactionSucceedFail = 'OnTransactionSucceedFail',
  SucceedTransactionOwnerDidNotFound = 'SucceedTransactionOwnerDidNotFound',
  SucceedTransactionOwnerAmountMismatch = 'SucceedTransactionOwnerAmountMismatch',
}

export enum ShareAvailableError {
  CreateShareOnStockFail = 'CreateShareOnStockFail',
  DeleteShareOnStockFail = 'DeleteShareOnStockFail',
  GetSharesCountFail = 'GetSharesCountFail',
  SearchShareOnStockFail = 'SearchShareOnStockFail',
  ShareBuyFailed = 'ShareBuyFailed',
  ShareOnStockNotFound = 'ShareOnStockNotFound',
  BuyShareAmountTooMuch = 'BuyShareAmountTooMuch',
  OnTransactionFail = 'OnTransactionFail',
}

export enum ShareProposalError {
  ShareProposalCreateFail = 'ShareProposalCreateFail',
  ShareProposalMaxReached = 'ShareProposalMaxReached',
  ShareProposalDeleteFail = 'ShareProposalDeleteFail',
  ShareProposalNotFound = 'ShareProposalNotFound',
  ShareProposalSearchFail = 'ShareProposalSearchFail',
  ShareProposalTakeProposalFail = 'ShareProposalTakeProposalFail',
  TakeProposalAmountTooMuch = 'TakeProposalAmountTooMuch',
}

export enum OperationError {
  AddOperationFail = 'AddOperationFail',
  GetSharesCountFail = 'GetSharesCountFail',
  GetOperationFail = 'GetOperationFail',
  UpdateOperationStatusFail = 'UpdateOperationStatusFail',
}
