import { Role } from '../../generated/prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  readonly role!: Role;
}
