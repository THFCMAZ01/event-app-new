import { Elysia } from 'elysia';
import { verifyToken } from '../utils/jwt.utils';

export const jwtMiddleware = new Elysia().derive({ as: 'global' }, async ({ headers, set }) => {
  const auth = headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    set.status = 401;
    return { error: 'Unauthorized' };
  }
  const token = auth.split(' ')[1];
  const user = verifyToken(token);
  if (!user) {
    set.status = 401;
    return { error: 'Invalid token' };
  }
  return { user };
});

export function roleMiddleware(role: string) {
  return new Elysia().onBeforeHandle(({ user, set }) => {
    if (!user || user.role !== role) {
      set.status = 403;
      return { error: 'Forbidden' };
    }
  });
}
