# Event Management App

A TypeScript-based monolithic event management API with role-based access control, event approval, attendee RSVPs, email notifications, and live updates over WebSockets.

## Tech stack

- Elysia and TypeScript for the API
- Prisma ORM with PostgreSQL
- JWT authentication and bcrypt password hashing
- WebSockets for event updates
- Nodemailer with Ethereal for development email previews
- Swagger UI for API exploration

## Requirements

- Node.js 18.18 or newer
- npm
- PostgreSQL database

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your values:

   ```bash
   cp .env.example .env
   ```

3. Create the database and apply the migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The server runs on `http://localhost:3000` by default. Swagger UI is available at `/swagger`.

## Environment variables

See `.env.example` for the required variables. Never commit your real `.env` file or production secrets.

## Roles and access

- **ATTENDEE**: default role assigned to every public sign-up; can RSVP to approved events.
- **ORGANIZER**: can create events and manage events they own.
- **ADMIN**: can approve events and manage any event.

Public registration intentionally does not accept a role from the client. Organizer and admin accounts must be provisioned through a trusted administrative process; do not expose role selection on the public sign-up endpoint.

## Main API routes

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/signup` | Public | Register an attendee |
| POST | `/api/login` | Public | Obtain a JWT |
| GET | `/api/events` | Public | List approved events |
| POST | `/api/events` | Organizer | Create an event pending approval |
| PUT | `/api/events/:id` | Owner organizer or admin | Update an event |
| DELETE | `/api/events/:id` | Owner organizer or admin | Delete an event |
| PUT | `/api/events/:id/approve` | Admin | Approve an event |
| POST | `/api/events/:id/rsvp` | Attendee | Create or update an RSVP |

Send protected requests with an `Authorization: Bearer <token>` header.

## Realtime updates

Connect to `ws://localhost:3000/ws`. Connected clients subscribe to the `events` channel and receive JSON updates when an event or RSVP changes.

## Email previews

Development welcome emails are sent using the Ethereal SMTP credentials in `.env`. View generated messages at [Ethereal Email](https://ethereal.email/messages).

## Build

```bash
npm run build
npm start
```

## Student

2410123 — Joshua Mazaza — BSE
