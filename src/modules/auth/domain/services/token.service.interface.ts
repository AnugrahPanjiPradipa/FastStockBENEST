export const TOKEN_SERVICE = 'TOKEN_SERVICE';

export interface ITokenService {
  generateJwtToken(payload: { id: string; role: string }): string;
  generateRandomToken(): string;
}
