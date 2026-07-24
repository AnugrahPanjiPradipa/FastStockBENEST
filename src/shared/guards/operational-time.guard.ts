import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { OperationalTimeChecker } from '../utils/operational-time.checker';

@Injectable()
export class OperationalTimeGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean {
    OperationalTimeChecker.checkOperationalHours();
    return true;
  }
}
