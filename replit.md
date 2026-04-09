# Workspace

## Overview

**Inbox Ticket** — Plateforme de gestion et vente de tickets d'événements avec paiement multi-méthode (Orange Money, MVola, Mastercard). Design africain élégant : thème noir, vert foncé et blanc.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, Recharts, Framer Motion, Lucide React

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── inbox-ticket/       # Frontend React + Vite (main app)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seeding script
```

## Inbox Ticket - Features

### Public Pages
- `/` — Landing page with hero, featured events, search
- `/events` — Browse & filter events (category, city, date)
- `/events/:id` — Event detail with ticket types and buy button
- `/checkout` — Order form + payment (Orange Money, MVola, Mastercard)
- `/orders/:id` — Order confirmation with QR code

### Admin Pages (all under `/admin`)
- `/admin` — Dashboard with KPIs, charts (revenue, sales by event, payment methods), recent orders
- `/admin/events` — Events CRUD management with ticket types
- `/admin/orders` — Order tracking with status filters
- `/admin/payments` — Payment transaction history

## Database Schema

- `events` — Event catalog
- `ticket_types` — Ticket types per event (VIP, Standard, Économique)
- `orders` — Customer ticket purchases
- `payments` — Payment transactions (orange_money, mvola, mastercard)

## Routes

All API routes under `/api`:
- `GET/POST /api/events`, `GET/PUT/DELETE /api/events/:id`
- `GET/POST /api/ticket-types`
- `GET/POST /api/orders`, `GET /api/orders/:id`
- `GET/POST /api/payments`
- `GET /api/admin/stats`
- `GET /api/admin/revenue-by-month`
- `GET /api/admin/sales-by-event`
- `GET /api/admin/payment-methods`

## Seeding

Run: `pnpm --filter @workspace/scripts run seed`
Creates: 6 events, 18 ticket types, 40 orders, ~32 payments with realistic Malagasy data.

---

## Inbox Ticket Template (`artifacts/inbox-template`)

**Static Next.js 15 template** — no backend, no database. All data is mock/static.
Designed for integration with the user's existing MySQL + Python backend.

**Stack**: Next.js 15 (App Router), Tailwind CSS v4, React 19, qrcode.react, framer-motion

**Preview**: `/inbox-template/`

**Workflow**: `pnpm --filter @workspace/inbox-template run dev` (port 20407)

### Pages

**Public** (avec navigation + footer)
- `/inbox-template/` — Accueil : hero, stats, événements à venir, modes de paiement
- `/inbox-template/events` — Liste avec filtres (recherche, catégorie, à venir/passé)
- `/inbox-template/events/[id]` — Détail événement, sélection billets, panier flottant
- `/inbox-template/checkout` — Commande 3 étapes (infos, paiement, confirmation)
- `/inbox-template/confirmation` — Succès + QR code billet
- `/inbox-template/mes-billets` — Connexion puis liste des billets avec QR
- `/inbox-template/auth` — Connexion / inscription

**Admin** (sidebar, sans auth)
- `/inbox-template/admin` — Tableau de bord : KPIs, graphique revenus, modes paiement
- `/inbox-template/admin/events` — Liste des événements
- `/inbox-template/admin/events/[id]` — Détail + commandes
- `/inbox-template/admin/users` — Membres de l'équipe

**Organisateur** (sans sidebar)
- `/inbox-template/organizer/login` — Connexion organisateur
- `/inbox-template/organizer/events` — Événements gérés
- `/inbox-template/organizer/events/[id]` — Tabs: vue d'ensemble / scan billets / ventes

### Mock data (`lib/mock-data.ts`)
- 6 événements (Gala, Festival, Concert, Conférence, Mode, Soirée électro)
- 3 types de billets par événement
- 10 commandes (clients malgaches)
- Stats admin, revenus mensuels, stats paiement (Orange Money, MVola, Espèces)

### Design
- Thème africain luxe sombre : `#080f09` fond, `#1a4525` primaire, `#2d9e4e` accent
- UI entière en français, montants en MGA (Ariary)
- QR format : `INBOXTICKET-ORD-{id}-{phone}`
