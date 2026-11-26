import 'dotenv/config';
import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { node } from '@elysiajs/node';
import { staticPlugin } from '@elysiajs/static';
import { prisma } from './prisma/client';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import { configureRealtimePublisher } from './services/realtime.service';

const port = Number(process.env.PORT) || 3000;

const app = new Elysia({ adapter: node() })
  .use(swagger())
  .use(staticPlugin({ assets: 'public', prefix: '/' }))
  .group('/api', (api) => api
    .use(authRoutes)
    .use(eventRoutes)
  )
  .ws('/ws', {
    open(ws) {
      console.log('WebSocket connected');
      ws.subscribe('events');
    },
    message(_ws, message) {
      console.log('WebSocket message:', message);
    },
    close() {
      console.log('WebSocket disconnected');
    },
  })
  .onError(({ code, error, set }) => {
    console.error(code, error);

    if (code === 'VALIDATION') {
      set.status = 400;
      return { error: 'Request validation failed' };
    }

    if (set.status === 200) {
      set.status = 500;
    }

    return { error: 'Server error' };
  })
  .listen(port);

configureRealtimePublisher((channel, payload) => {
  app.server?.publish(channel, JSON.stringify(payload));
});

console.log(`Event app running on port ${port}`);

async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
