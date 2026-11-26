import { Elysia, t } from 'elysia';
import { roleMiddleware, authPlugin } from '../middleware/auth.middleware';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  rsvpEvent,
} from '../controllers/event.controller';

export default new Elysia()
  .use(authPlugin)
  .get('/events', getEvents)
  .post('/events', ({ body, user, set }) => createEvent({ body, user, set }), {
    beforeHandle: roleMiddleware('ORGANIZER'),
    body: t.Object({
      title: t.String({ minLength: 1, error: 'Title required' }),
      description: t.String(),
      date: t.String({ format: 'date-time', error: 'Invalid date' }),
      location: t.String({ minLength: 1, error: 'Location required' }),
    }),
  })
  .put('/events/:id', ({ params, body, user, set }) =>
    updateEvent({ params, body, user, set }), {
    beforeHandle: roleMiddleware(['ADMIN', 'ORGANIZER']),
    body: t.Object({
      title: t.Optional(t.String({ minLength: 1 })),
      description: t.Optional(t.String()),
      date: t.Optional(t.String({ format: 'date-time' })),
      location: t.Optional(t.String({ minLength: 1 })),
    }),
  })
  .delete('/events/:id', ({ params, user, set }) =>
    deleteEvent({ params, user, set }), {
    beforeHandle: roleMiddleware(['ADMIN', 'ORGANIZER']),
  })
  .put('/events/:id/approve', ({ params, set }) => approveEvent({ params, set }), {
    beforeHandle: roleMiddleware('ADMIN'),
  })
  .post('/events/:id/rsvp', ({ params, body, user, set }) =>
    rsvpEvent({ params, body, user, set }), {
    beforeHandle: roleMiddleware('ATTENDEE'),
    body: t.Object({
      status: t.Enum({ GOING: 'GOING', MAYBE: 'MAYBE', NOT_GOING: 'NOT_GOING' }),
    }),
  });
