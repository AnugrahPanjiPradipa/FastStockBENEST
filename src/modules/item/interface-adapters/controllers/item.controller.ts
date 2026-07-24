import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
// Use Cases
import { GetItemsUseCase } from '../../application/use-cases/get-items.use-case';
import { CreateItemUseCase } from '../../application/use-cases/create-item.use-case';
import { ProcessInventoryUseCase } from '../../application/use-cases/process-transaction.use-case';
import { UpdateItemUseCase } from '../../application/use-cases/update-item.use-case';
import { DeleteItemUseCase } from '../../application/use-cases/delete-item.use-case';

// DTOs
import { CreateItemDto } from '../dtos/create-item.dto';
import { ProcessInventoryDto } from '../dtos/process-inventory.dto';
import { GetItemsQueryDto } from '../dtos/get-items-query.dto';

// Shared Components (Tepat 4 tingkat naik: ../../../..)
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { OperationalTimeGuard } from '../../../../shared/guards/operational-time.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';

@Controller('api/items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ItemController {
  constructor(
    private readonly getItemsUseCase: GetItemsUseCase,
    private readonly createItemUseCase: CreateItemUseCase,
    private readonly processInventoryUseCase: ProcessInventoryUseCase,
    private readonly updateItemUseCase: UpdateItemUseCase,
    private readonly deleteItemUseCase: DeleteItemUseCase,
  ) {}

  @Get()
  @Roles('admin', 'user')
  async getItems(@Query() query: GetItemsQueryDto) {
    const result = await this.getItemsUseCase.execute(
      query.search,
      query.page,
      query.limit,
    );
    return {
      items: result.items,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };
  }

  @Post()
  @Roles('admin')
  async createItem(@Body() dto: CreateItemDto) {
    const createItemPayload = {
      name: (dto as any).name ?? (dto as any).nama,
      stockGudang: (dto as any).stockGudang,
      asal: (dto as any).asal,
    };
    return await this.createItemUseCase.execute(createItemPayload);
  }

  @Put('process/:id')
  @Roles('admin', 'user')
  @UseGuards(OperationalTimeGuard)
  async processInventory(
    @Param('id') id: string,
    @Body() dto: ProcessInventoryDto,
  ) {
    return await this.processInventoryUseCase.execute(
      id,
      dto.actionType!,
      dto.jumlah!,
      dto.tujuan,
    );
  }

  @Put(':id')
  @Roles('admin')
  async updateItem(@Param('id') id: string, @Body() body: any) {
    return await this.updateItemUseCase.execute(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  async deleteItem(@Param('id') id: string) {
    await this.deleteItemUseCase.execute(id);
    return { message: 'Item berhasil dihapus dari sistem' };
  }
}
