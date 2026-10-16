import { SetMetadata } from '@nestjs/common';
import { SportLKRole } from './auth.types';

export const ROLES_KEY = 'sportlk_roles';
export const Roles = (...roles: SportLKRole[]) => SetMetadata(ROLES_KEY, roles);
