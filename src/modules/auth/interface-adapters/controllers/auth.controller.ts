import { Controller, Post, Get, Put, Body, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';

import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const host = req.get('host') || 'localhost:5000';
    return await this.registerUseCase.execute(dto, host, req.protocol);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<any> {
    return await this.loginUseCase.execute(dto);
  }

  @Get('verifyemail/:token')
  async verifyEmail(@Param('token') token: string) {
    return await this.verifyEmailUseCase.execute(token);
  }

  @Post('forgotpassword')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.forgotPasswordUseCase.execute(dto.email!);
  }

  @Put('resetpassword/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return await this.resetPasswordUseCase.execute(token, dto.password!);
  }
}
