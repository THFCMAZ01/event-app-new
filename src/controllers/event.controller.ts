import { PrismaClient } from '@prisma/client';
import { broadcastUpdate } from '../index';

const prisma = new PrismaClient();

export async function getEvents() {
  try {
    return await prisma.event.findMany({ where: { approved: true } });
  } catch (e) {
    console.error('Get events error:', e);
    throw new Error('Failed to fetch events');
  }
}

export async function createEvent({ body, user, set }: { body: any, user: any, set: any }) {
  try {
    const event = await prisma.event.create({
      data: { ...body, organizerId: user.id, approved: false },
    });
    broadcastUpdate('events', { action: 'create', event });
    return event;
  } catch (e) {
    console.error('Create event error:', e);
    set.status = 500;
    return { error: 'Failed to create event' };
  }
}

export async function updateEvent({ params, body, set }: { params: { id: string }, body: any, set: any }) {
  try {
    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) {
      set.status = 404;
      return { error: 'Event not found' };
    }
    if (event.organizerId !== (set.user?.id || '')) {
      set.status = 403;
      return { error: 'Not authorized to update this event' };
    }
    const updated = await prisma.event.update({ where: { id: params.id }, data: body });
    broadcastUpdate('events', { action: 'update', event: updated });
    return updated;
  } catch (e) {
    console.error('Update event error:', e);
    set.status = 500;
    return { error: 'Failed to update event' };
  }
}

export async function deleteEvent({ params, set }: { params: { id: string }, set: any }) {
  try {
    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) {
      set.status = 404;
      return { error: 'Event not found' };
    }
    if (event.organizerId !== (set.user?.id || '')) {
      set.status = 403;
      return { error: 'Not authorized to delete this event' };
    }
    await prisma.event.delete({ where: { id: params.id } });
    broadcastUpdate('events', { action: 'delete', id: params.id });
    return { message: 'Event deleted' };
  } catch (e) {
    console.error('Delete event error:', e);
    set.status = 500;
    return { error: 'Failed to delete event' };
  }
}

export async function approveEvent({ params, set }: { params: { id: string }, set: any }) {
  try {
    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) {
      set.status = 404;
      return { error: 'Event not found' };
    }
    const updated = await prisma.event.update({ where: { id: params.id }, data: { approved: true } });
    broadcastUpdate('events', { action: 'approve', event: updated });
    return updated;
  } catch (e) {
    console.error('Approve event error:', e);
    set.status = 500;
    return { error: 'Failed to approve event' };
  }
}

export async function rsvpEvent({ params, body, user, set }: { params: { id: string }, body: any, user: any, set: any }) {
  try {
    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) {
      set.status = 404;
      return { error: 'Event not found' };
    }
    const rsvp = await prisma.rSVP.upsert({
      where: { userId_eventId: { userId: user.id, eventId: params.id } },
      update: { status: body.status },
      create: { userId: user.id, eventId: params.id, status: body.status },
    });
    broadcastUpdate('events', { action: 'rsvp', rsvp });
    return rsvp;
  } catch (e) {
    console.error('RSVP error:', e);
    set.status = 400;
    return { error: 'Failed to RSVP' };
  }
}
