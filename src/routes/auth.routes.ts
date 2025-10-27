import { Elysia, t } from 'elysia';
import { signup, login } from '../controllers/auth.controller';

export default new Elysia()
  .post('/signup', ({ body, set }) => signup({ body, set }), {
    body: t.Object({
      email: t.String({ format: 'email', error: 'Invalid email' }),
      password: t.String({ minLength: 6, error: 'Password too short' }),
      role: t.Optional(t.Enum({ ADMIN: 'ADMIN', ORGANIZER: 'ORGANIZER', ATTENDEE: 'ATTENDEE' }))
    })
  })
  .post('/login', ({ body, set }) => login({ body, set }), {
    body: t.Object({
      email: t.String({ format: 'email', error: 'Invalid email' }),
      password: t.String({ minLength: 6, error: 'Password too short' })
    })
  });
