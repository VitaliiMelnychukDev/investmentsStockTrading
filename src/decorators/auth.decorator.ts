import { SetMetadata } from '@nestjs/common';
import { authDecoratorKey } from '../types/auth';

export const AuthNeeded = () => SetMetadata(authDecoratorKey, true);
