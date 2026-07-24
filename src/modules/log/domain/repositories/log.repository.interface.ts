import { LogEntity } from '../entities/log.entity';

export const LOG_REPOSITORY = 'LOG_REPOSITORY';

export interface ILogRepository {
  findAll(queryFilter?: any): Promise<LogEntity[]>;
  findById(id: string, session?: any): Promise<LogEntity | null>;
  create(logData: Partial<LogEntity>, session?: any): Promise<LogEntity>;
  update(
    id: string,
    logData: Partial<LogEntity>,
    session?: any,
  ): Promise<LogEntity | null>;
  deleteById(id: string, session?: any): Promise<boolean>;
  deleteByDateRange(
    startDate: Date,
    endDate: Date,
    session?: any,
  ): Promise<number>;
}
