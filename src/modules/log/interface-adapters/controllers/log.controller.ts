import {
  Controller,
  Get,
  Delete,
  Put,
  Query,
  Param,
  Body,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

// Use Cases
import { GetLogsUseCase } from '../../application/use-cases/get-logs.use-case';
import { ExportLogsExcelUseCase } from '../../application/use-cases/export-logs-excel.use-case';
import { DeleteLogsByDateUseCase } from '../../application/use-cases/delete-logs-by-date.use-case';
import { DeleteLogAndRollbackUseCase } from '../../application/use-cases/delete-log-rollback.use-case';
import { UpdateLogAndAdjustStockUseCase } from '../../application/use-cases/update-log-adjust-stock.use-case';

// DTOs
import { GetLogsQueryDto } from '../dtos/get-logs-query.dto';
import { DeleteLogsDateDto } from '../dtos/delete-logs-date.dto';

// Shared Components (Tepat 4 tingkat naik: ../../../..)
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';

@Controller('api/logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogController {
  constructor(
    private readonly getLogsUseCase: GetLogsUseCase,
    private readonly exportLogsExcelUseCase: ExportLogsExcelUseCase,
    private readonly deleteLogsByDateUseCase: DeleteLogsByDateUseCase,
    private readonly deleteLogAndRollbackUseCase: DeleteLogAndRollbackUseCase,
    private readonly updateLogAndAdjustStockUseCase: UpdateLogAndAdjustStockUseCase,
  ) {}

  @Get()
  @Roles('admin', 'user')
  async getLogs(@Query() query: GetLogsQueryDto, @Req() req: any) {
    const userRole = req.user?.role; // Ekstrak role dari JWT Auth Guard
    return await this.getLogsUseCase.execute(query.date, query.type, userRole);
  }

  @Get('export')
  @Roles('admin', 'user')
  async exportLogsToExcel(
    @Query() query: GetLogsQueryDto,
    @Res() res: Response,
  ) {
    const buffer = await this.exportLogsExcelUseCase.execute(
      query.date,
      query.type,
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=log-${query.date || 'all'}.xlsx`,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    return res.send(buffer);
  }

  @Delete('by-date')
  @Roles('admin')
  async deleteLogsByDate(@Body() dto: DeleteLogsDateDto) {
    const count = await this.deleteLogsByDateUseCase.execute(dto.date!);
    return { message: `Berhasil hapus ${count} log` };
  }

  @Delete(':id')
  @Roles('admin')
  async deleteLogAndRollback(@Param('id') id: string) {
    return await this.deleteLogAndRollbackUseCase.execute(id);
  }

  @Put(':id')
  @Roles('admin')
  async updateLogAndAdjustStock(@Param('id') id: string, @Body() body: any) {
    return await this.updateLogAndAdjustStockUseCase.execute(id, body);
  }
}
