export enum AccountMessage {
  CardNumberSuccessfullyUpdated = 'CardNumberSuccessfullyUpdated',
}

export enum ShareMessage {
  ShareSuccessfullyCreated = 'ShareSuccessfullyCreated',
  SharesSuccessfullyAdded = 'SharesSuccessfullyAdded',
  SharePriceUpdatedSuccessfully = 'SharePriceUpdatedSuccessfully',
  ShareSuccessfullySendOnStock = 'ShareSuccessfullySendOnStock',
}

export enum ShareAvailableMessage {
  ShareOnStockSuccessfullyDeleted = 'ShareOnStockSuccessfullyDeleted',
  ShareBoughtAndWaitedOnPayment = 'ShareBoughtAndWaitedOnPayment',
}

export enum ShareProposalMessage {
  ShareProposalSuccessfullyCreated = 'ShareProposalSuccessfullyCreated',
  ShareProposalSuccessfullyDeleted = 'ShareProposalSuccessfullyDeleted',
  ShareProposalSuccessfullyUpdated = 'ShareProposalSuccessfullyUpdated',
  TakeProposalSuccess = 'TakeProposalSuccess',
}
