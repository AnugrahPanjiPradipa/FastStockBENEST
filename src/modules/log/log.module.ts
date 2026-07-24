import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemModule } from '../item/item.module';

import { LOG_REPOSITORY } from './domain/repositories/log.repository.interface';
import {
  LogDocument,
  LogSchema,
} from './infrastructure/persistence/log.schema';
import { LogRepositoryImpl } from './infrastructure/persistence/log.repository.impl';

import { GetLogsUseCase } from './application/use-cases/get-logs.use-case';
import { ExportLogsExcelUseCase } from './application/use-cases/export-logs-excel.use-case';
import { DeleteLogsByDateUseCase } from './application/use-cases/delete-logs-by-date.use-case';
import { DeleteLogAndRollbackUseCase } from './application/use-cases/delete-log-rollback.use-case';
import { UpdateLogAndAdjustStockUseCase } from './application/use-cases/update-log-adjust-stock.use-case';

import { LogController } from './interface-adapters/controllers/log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LogDocument.name, schema: LogSchema }]),
    forwardRef(() => ItemModule), // forwardRef memutus circular dependency dengan ItemModule
  ],
  controllers: [LogController],
  providers: [
    GetLogsUseCase,
    ExportLogsExcelUseCase,
    DeleteLogsByDateUseCase,
    DeleteLogAndRollbackUseCase,
    UpdateLogAndAdjustStockUseCase,
    {
      provide: LOG_REPOSITORY,
      useClass: LogRepositoryImpl,
    },
  ],
  exports: [LOG_REPOSITORY, GetLogsUseCase],
})
export class LogModule {}
