import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  readonly token!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password!: string;
}
