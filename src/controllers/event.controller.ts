import { prisma } from '../prisma/client';
import { broadcastUpdate } from '../services/realtime.service';
import type { AuthenticatedUser } from '../utils/jwt.utils';

export async function getEvents() {
  try {
    return await prisma.event.findMany({
      where: { approved: true },
      orderBy: { date: 'asc' },
    });
  } catch (error) {
    console.error('Get events error:', error);
    throw new Error('Failed to fetch events');
  }
}

export async function createEvent({
  body,
  user,
  set,
}: {
  body: any;
  user: AuthenticatedUser;
  set: any;
}) {
  try {
    const event = await prisma.event.create({
      data: {
        ...body,
        date: new Date(body.date),
        organizerId: user.id,
        approved: false,
      },
    });

    broadcastUpdate('events', { action: 'create', event });
    return event;
  } catch (error) {
    console.error('Create event error:', error);
    set.status = 500;
    return { error: 'Failed to create event' };
  }
}

export async function updateEvent({
  params,
  body,
  user,
  set,
}: {
  params: { id: string };
  body: any;
  user: AuthenticatedUser;
  set: any;
}) {
  try {
    const event = await prisma.event.findUnique({ where: { id: params.id } });

    if (!event) {
      set.status = 404;
      return { error: 'Event not found' };
    }

    if (user.role !== 'ADMIN' && event.organizerId !== user.id) {
      set.status = 403;
      return { error: 'Not authorized to update this event' };
    }

    const updateData = {
      ...body,
      ...(body.date ? { date: new Date(body.date) } : {}),
    };

    const updated = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
    });

    broadcastUpdate('events', { action: 'update', event: updated });
    return updated;
  } catch (error) {
    console.error('Update event error:', error);
    set.status = 500;
    return { error: 'Failed to update event' };
  }
}

export async function deleteEvent({
  params,
  user,
  set,
}: {
  params: { id: string };
  user: AuthenticatedUser;
  set: any;
}) {
  try {
    const event = await prisma.event.findUnique({ where: { id: params.id } });

    if (!event) {
      set.status = 404;
      return { error: 'Event not found' };
    }

    if (user.role !== 'ADMIN' && event.organizerId !== user.id) {
      set.status = 403;
      return { error: 'Not authorized to delete this event' };
    }

    await prisma.event.delete({ where: { id: params.id } });
    broadcastUpdate('events', { action: 'delete', id: params.id });
    return { message: 'Event deleted' };
  } catch (error) {
    console.error('Delete event error:', error);
    set.status = 500;
    return { error: 'Failed to delete event' };
  }
}

export async function approveEvent({
  params,
  set,
}: {
  params: { id: string };
  set: any;
}) {
  try {
    const event = await prisma.event.findUnique({ where: { id: params.id } });

    if (!event) {
      set.status = 404;
      return { error: 'Event not found' };
    }

    const updated = await prisma.event.update({
      where: { id: params.id },
      data: { approved: true },
    });

    broadcastUpdate('events', { action: 'approve', event: updated });
    return updated;
  } catch (error) {
    console.error('Approve event error:', error);
    set.status = 500;
    return { error: 'Failed to approve event' };
  }
}

export async function rsvpEvent({
  params,
  body,
  user,
  set,
}: {
  params: { id: string };
  body: any;
  user: AuthenticatedUser;
  set: any;
}) {
  try {
    const event = await prisma.event.findUnique({ where: { id: params.id } });

    if (!event) {
      set.status = 404;
      return { error: 'Event not found' };
    }

    if (!event.approved) {
      set.status = 409;
      return { error: 'This event is not yet approved for RSVPs' };
    }

    const rsvp = await prisma.rSVP.upsert({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: params.id,
        },
      },
      update: { status: body.status },
      create: {
        userId: user.id,
        eventId: params.id,
        status: body.status,
      },
    });

    broadcastUpdate('events', { action: 'rsvp', rsvp });
    return rsvp;
  } catch (error) {
    console.error('RSVP error:', error);
    set.status = 500;
    return { error: 'Failed to RSVP' };
  }
}
