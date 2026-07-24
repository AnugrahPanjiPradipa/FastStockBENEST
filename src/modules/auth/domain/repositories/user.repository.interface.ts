import { UserEntity } from '../entities/user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findByVerificationToken(token: string): Promise<UserEntity | null>;
  findByResetToken(token: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(userData: Partial<UserEntity>): Promise<UserEntity>;
  update(id: string, userData: Partial<UserEntity>): Promise<UserEntity | null>;
}
