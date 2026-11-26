import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export type AppUserRole = 'ADMIN' | 'ORGANIZER' | 'ATTENDEE';

export interface AuthenticatedUser {
  id: string;
  role: AppUserRole;
}

const validRoles = new Set<AppUserRole>(['ADMIN', 'ORGANIZER', 'ATTENDEE']);

export function signToken(payload: AuthenticatedUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (
      typeof payload === 'string' ||
      typeof payload.id !== 'string' ||
      typeof payload.role !== 'string' ||
      !validRoles.has(payload.role as AppUserRole)
    ) {
      return null;
    }

    return {
      id: payload.id,
      role: payload.role as AppUserRole,
    };
  } catch {
    return null;
  }
}
