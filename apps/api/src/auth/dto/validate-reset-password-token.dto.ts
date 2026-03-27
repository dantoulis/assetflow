import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateResetPasswordTokenDto {
  @IsNotEmpty()
  @IsString()
  readonly token!: string;
}
