import { Elysia } from 'elysia';
import {
  verifyToken,
  type AppUserRole,
  type AuthenticatedUser,
} from '../utils/jwt.utils';

/**
 * Adds an optional authenticated user to the Elysia request context.
 * Public routes may continue without a token; protected routes use roleMiddleware.
 */
export const authPlugin = new Elysia({ name: 'auth-plugin' }).derive(
  { as: 'scoped' },
  ({ headers }) => {
    const authorization = headers.authorization;
    const user =
      authorization?.startsWith('Bearer ')
        ? verifyToken(authorization.slice('Bearer '.length))
        : null;

    return { user };
  },
);

interface RoleGuardContext {
  user: AuthenticatedUser | null;
  set: { status?: number | string };
}

/**
 * Elysia beforeHandle hook that requires one or more application roles.
 */
export function roleMiddleware(requiredRoles: AppUserRole | AppUserRole[]) {
  const allowedRoles = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  return ({ user, set }: RoleGuardContext) => {
    if (!user) {
      set.status = 401;
      return { error: 'Authentication required' };
    }

    if (!allowedRoles.includes(user.role)) {
      set.status = 403;
      return { error: 'Insufficient permissions' };
    }
  };
}
