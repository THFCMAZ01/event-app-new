import { Elysia, t } from 'elysia';
import { roleMiddleware } from '../middleware/auth.middleware';
import { getEvents, createEvent, updateEvent, deleteEvent, approveEvent, rsvpEvent } from '../controllers/event.controller';

export default new Elysia()
  .get('/events', getEvents)
  .guard({}, app => app
    .use(roleMiddleware('ORGANIZER'))
    .post('/events', ({ body, user, set }) => createEvent({ body, user, set }), {
      body: t.Object({
        title: t.String({ minLength: 1, error: 'Title required' }),
        description: t.String(),
        date: t.String({ format: 'date-time', error: 'Invalid date' }),
        location: t.String({ minLength: 1, error: 'Location required' })
      })
    })
    .put('/events/:id', ({ params, body, set }) => updateEvent({ params, body, set }), {
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        date: t.Optional(t.String({ format: 'date-time' })),
        location: t.Optional(t.String())
      })
    })
    .delete('/events/:id', ({ params, set }) => deleteEvent({ params, set }))
  )
  .use(roleMiddleware('ADMIN'))
  .put('/events/:id/approve', ({ params, set }) => approveEvent({ params, set }))
  .use(roleMiddleware('ATTENDEE'))
  .post('/events/:id/rsvp', ({ params, body, user, set }) => rsvpEvent({ params, body, user, set }), {
    body: t.Object({
      status: t.Enum({ GOING: 'GOING', MAYBE: 'MAYBE', NOT_GOING: 'NOT_GOING' })
    })
  });
