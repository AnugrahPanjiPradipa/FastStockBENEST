import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogModule } from '../log/log.module';

// Layer 1 & 4: Interface & Repository Implementation
import { ITEM_REPOSITORY } from './domain/repositories/item.repository.interface';
import {
  ItemDocument,
  ItemSchema,
} from './infrastructure/persistence/item.schema';
import { ItemRepositoryImpl } from './infrastructure/persistence/item.repository.impl';

// Layer 2: Use Cases
import { GetItemsUseCase } from './application/use-cases/get-items.use-case';
import { CreateItemUseCase } from './application/use-cases/create-item.use-case';
import { ProcessInventoryUseCase } from './application/use-cases/process-transaction.use-case';
import { UpdateItemUseCase } from './application/use-cases/update-item.use-case';
import { DeleteItemUseCase } from './application/use-cases/delete-item.use-case';

// Layer 3: Controller
import { ItemController } from './interface-adapters/controllers/item.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ItemDocument.name, schema: ItemSchema },
    ]),
    forwardRef(() => LogModule), // 2. Gunakan forwardRef(() => LogModule) di sini
  ],
  controllers: [ItemController],
  providers: [
    GetItemsUseCase,
    CreateItemUseCase,
    ProcessInventoryUseCase,
    UpdateItemUseCase,
    DeleteItemUseCase,
    {
      provide: ITEM_REPOSITORY,
      useClass: ItemRepositoryImpl,
    },
  ],
  exports: [ITEM_REPOSITORY, GetItemsUseCase],
})
export class ItemModule {}
