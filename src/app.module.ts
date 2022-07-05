import { Module } from '@nestjs/common';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
import { TokenService } from './services/token.service';
import { PaginationService } from './services/pagination.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/data-source.config';
import { entitiesList } from './types/general';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ShareService } from './services/share.service';
import { ShareController } from './controllers/share.controller';
import { ShareOwnerService } from './services/share-owner.service';
import { ShareAvailableService } from './services/share-available.service';
import { ShareOnStockController } from './controllers/share-on-stock.controller';
import { ShareProposalService } from './services/share-proposal.service';
import { ShareProposalController } from './controllers/share-proposal.controller';
import { ConsumerService } from './services/consumer.service';
import { ProducerService } from './services/producer.service';
import { OperationService } from './services/operation.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature(entitiesList),
  ],
  controllers: [
    AccountController,
    ShareController,
    ShareOnStockController,
    ShareProposalController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AccountService,
    ShareService,
    ShareAvailableService,
    ShareProposalService,
    ShareOwnerService,
    TokenService,
    PaginationService,
    ConsumerService,
    ProducerService,
    OperationService,
  ],
})
export class AppModule {}
