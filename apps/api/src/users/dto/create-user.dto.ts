import { IsString, IsEmail, IsEnum } from 'class-validator';
import { Role } from '../../generated/prisma/enums';

export class CreateUserDto {
  @IsString()
  readonly username!: string;
  @IsEmail()
  readonly email!: string;
  @IsString()
  readonly password!: string;
  @IsEnum(Role)
  readonly role!: 'USER';
}
