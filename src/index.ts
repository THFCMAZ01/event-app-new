import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { node } from '@elysiajs/node';
import { staticPlugin } from '@elysiajs/static';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import { jwtMiddleware } from './middleware/auth.middleware';

const prisma = new PrismaClient();

const app = new Elysia({ adapter: node() })
  .use(swagger())
  .use(staticPlugin({ assets: 'public', prefix: '/' }))
  .use(jwtMiddleware)
  .group('/api', (app) => app
    .use(authRoutes)
    .use(eventRoutes)
  )
  .ws('/ws', {
    open(ws) {
      console.log('WS connected');
      ws.subscribe('events');
    },
    message(ws, message) {
      console.log('WS msg:', message);
    },
    close(ws) {
      console.log('WS closed');
    }
  })
  .onError(({ code, error, set }) => {
    console.error(code, error);
    set.status = 500;
    return { error: 'Server Error' };
  })
  .listen(3000);

console.log(`Server at http://localhost:3000`);

export function broadcastUpdate(channel: string, data: any) {
  app.server?.publish(channel, JSON.stringify(data));
}

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
