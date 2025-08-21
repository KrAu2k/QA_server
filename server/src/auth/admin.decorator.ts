import { SetMetadata } from '@nestjs/common';

export const ADMIN_KEY = 'requireAdmin';
export const RequireAdmin = () => SetMetadata(ADMIN_KEY, true);
