export class UserEntity {
  constructor(
    public readonly id: string,
    public username: string,
    public email: string,
    public password?: string,
    public role: string = 'user',
    public isVerified: boolean = false,
    public verificationToken?: string,
    public resetPasswordToken?: string,
    public resetPasswordExpires?: Date,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
