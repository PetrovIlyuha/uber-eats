import { UserRole } from 'src/users/entities/user.entity';
import { SetMetadata } from '@nestjs/common';

export type AllowedRoles = keyof typeof UserRole | 'Anybody';

export const Role = (roles: AllowedRoles[]) => SetMetadata('role', [...roles]);
