export const EMAIL_SERVICE = 'EMAIL_SERVICE';

export interface IEmailService {
  sendVerificationEmail(
    to: string,
    username: string,
    token: string,
    host: string,
    protocol: string,
  ): Promise<void>;
  sendResetPasswordEmail(to: string, token: string): Promise<void>;
}
