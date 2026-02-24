# Loan Collection Manager

A full-stack collections case management system built with NestJS, Next.js, PostgreSQL, and Puppeteer.

## Quick Start

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001/api
- **Swagger:** http://localhost:3001/api/docs

## Architecture

### Monorepo Structure
```
/apps/api      — NestJS backend (TypeScript)
/apps/web      — Next.js frontend (shadcn/tailwind)
/packages/shared — Shared TypeScript enums and types
docker-compose.yml
```

### Backend Modules
| Module | Responsibility |
|--------|---------------|
| `CasesModule` | CRUD, filtering, pagination, KPIs |
| `AssignmentModule` | Rule engine, optimistic-lock updates, audit trail |
| `PdfModule` | Puppeteer HTML→PDF generation |
| `SchedulerModule` | Daily DPD recalculation cron |
| `MetricsModule` | System metrics endpoint |

### Rule Engine
Rules are stored in `apps/api/rules.json` — **no code changes needed** to add/edit rules.

Each rule has:
- `id` — unique identifier
- `condition` — field comparisons (`dpd`, `riskScore`) with operators (`gte`, `lte`, `gt`, `lt`)
- `action` — what to set (`stage`, `assignGroup`, `assignedTo`)
- `priority` — higher priority rules apply last (override semantics)

Every `POST /api/cases/:id/assign` stores a `RuleDecision` record with matched rules and human-readable reason.

### Optimistic Locking
The `Case` entity has a `version` field. Assignment updates use `updateMany` with a version check — throws `409 Conflict` if the record was modified concurrently.

### PDF Generation
Puppeteer runs inside Docker with `--no-sandbox` and `--disable-setuid-sandbox`. The HTML template is compiled server-side from case data.

## Local Development

```bash
# Install dependencies
yarn install

# Start PostgreSQL (Docker)
docker compose up postgres -d

# Set up .env
cp apps/api/.env.example apps/api/.env

# Run migrations + seed
cd apps/api
yarn prisma:migrate
yarn prisma:seed

# Start API
yarn dev:api

# Start frontend (new terminal)
yarn dev:web
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/cases` | Create case |
| `GET` | `/api/cases` | List with filters + pagination |
| `GET` | `/api/cases/kpis` | KPI stats |
| `GET` | `/api/cases/:id` | Case details |
| `POST` | `/api/cases/:id/actions` | Add action log |
| `POST` | `/api/cases/:id/assign` | Run assignment rules |
| `GET` | `/api/cases/:id/notice.pdf` | Download PDF notice |
| `GET` | `/api/customers` | List customers |
| `GET` | `/api/loans` | List loans |
| `GET` | `/api/metrics` | System metrics |
| `GET` | `/api/health` | Health check |

## Bonus Features
1. **Daily DPD recalculation** (`@Cron` at midnight) — auto-escalates case stage when DPD crosses a threshold band
2. **Metrics endpoint** — `GET /api/metrics` returns case counts by status/stage, avg DPD, daily activity

## Trade-offs
- Rules stored in JSON file for simplicity — could be moved to DB table with a management UI
- Puppeteer adds image size (~300MB); in production, consider a separate PDF microservice
- No auth/JWT implemented — would add `@nestjs/passport` + JWT guards in production
