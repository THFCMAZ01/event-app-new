 Event App

 Setup
1. npm install
2. Edit .env
3. npx prisma migrate dev
4. npm run dev

 Features
- Auth with roles (ADMIN, ORGANIZER, ATTENDEE)
- Event CRUD, approval, RSVP
- Realtime WebSocket updates
- Email notifications via Ethereal
- Zod validation, SOLID principles

 Test
- Insomnia: APIs at http://localhost:3000/swagger, WS at ws://localhost:3000/ws
- Browser: http://localhost:3000
- Check Ethereal emails: https://ethereal.email/messages

 Deploy
- Push to GitHub
- Deploy on Render: Set env vars in dashboard
- Use wss:// for WebSocket


2410123-Joshua-Mazaza-BSE
