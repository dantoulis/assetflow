import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly username!: string;

  @IsEmail()
  readonly email!: string;

  @IsString()
  readonly password!: string;

  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  @IsOptional()
  @IsString()
  readonly team?: string;

  @IsOptional()
  @IsString()
  readonly location?: string;
}
