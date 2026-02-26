# Loan Collection Manager

A full-stack collections case management system built with NestJS, Next.js, PostgreSQL, and Puppeteer.

## Quick Start (Docker)

```bash
# Copy and configure environment variables first
cp apps/api/.env.example apps/api/.env   # edit as needed

docker compose up --build
```

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001/api
- **Swagger:** http://localhost:3001/api/docs

Docker Compose starts three services in dependency order: `lcm-db` (Postgres) → `api` (NestJS, runs migrations + seed on boot) → `web` (Next.js). The API health check gate ensures the web container doesn't start until the API is ready.

---

## Local Development Setup

### Prerequisites
- Node.js 20+, Yarn 1.x
- Docker (for Postgres only)

### Steps

```bash
# 1. Install all workspace dependencies
yarn install

# 2. Start Postgres in the background
docker compose up lcm-db -d

# 3. Configure environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env — see Environment Variables below

# 4. Run database migrations
cd apps/api
yarn migration:run

# 5. Seed the database (5 customers, 6 loans, 6 cases)
yarn seed

# 6. Start API + web in parallel (from repo root)
cd ../..
yarn dev        # runs both concurrently
# or separately:
yarn dev:api    # NestJS on :3001
yarn dev:web    # Next.js on :3000
```

### Environment Variables

Create `apps/api/.env` with these keys:

```env
# Database
DB_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=lcm-db

# Set to true only for local dev without migrations
DB_SYNC=false
```

`DB_SYNC=true` uses TypeORM's `synchronize` to auto-apply schema changes — never use this in production; run explicit migrations instead.

### Useful Scripts (inside `apps/api`)

| Script | Description |
|--------|-------------|
| `yarn migration:run` | Apply all pending migrations |
| `yarn migration:revert` | Revert the last migration |
| `yarn migration:generate` | Generate a new migration from entity diff |
| `yarn seed` | Truncate all tables and re-seed demo data |
| `yarn start:dev` | Start API in watch mode |
| `yarn test` | Run unit tests |

---

## Architecture

### Monorepo Structure

```
/apps/api              NestJS backend (TypeScript + TypeORM)
/apps/web              Next.js 14 frontend (shadcn/tailwind)
/packages/shared       Shared TypeScript enums and interfaces
docker-compose.yml
```

The `@lcm/shared` package is a local workspace dependency used by both the API and web. It contains all enums (`CaseStage`, `CaseStatus`, `ActionType`, etc.) and the `Rule<R>` / `RuleResult<R>` generic interfaces consumed by the rule engine.

### Backend Modules

| Module | Responsibility |
|--------|---------------|
| `CaseModule` | CRUD operations, filtering with query builder, pagination, KPI aggregations |
| `CustomerModule` | Customer listing |
| `RulesModule` | Data-driven rule evaluation (see below) |
| `PdfGeneratorModule` | Server-side HTML→PDF via Puppeteer |
| `DbModule` | Global TypeORM configuration, entity registration |
| `HealthController` | `GET /api/health` — used by Docker health check |

### Data Model

```
Customer (1) ──< Loan (1) ──< Case
                                │
                                ├──< ActionLog   (contact history)
                                └──< RuleDecision (assignment audit trail)
```

- **Customer** — name, phone, email, country, `riskScore` (0–100)
- **Loan** — principal, outstanding, dueDate, status
- **Case** — dpd, stage (`SOFT/HARD/LEGAL`), status (`OPEN/IN_PROGRESS/RESOLVED/CLOSED`), assignedTo, assignedGroup, `version` (optimistic lock)
- **ActionLog** — type (`CALL/SMS/EMAIL/WHATSAPP`), outcome (`NO_ANSWER/PROMISE_TO_PAY/PAID/WRONG_NUMBER`), notes
- **RuleDecision** — matchedRules (JSON array), reason (text), FK to Case

### Optimistic Locking

`Case` has a `@VersionColumn()` managed by TypeORM. Every `save()` automatically increments `version` and includes a `WHERE version = $prev` clause. If two concurrent requests read the same version and both try to save, the second one throws `OptimisticLockVersionMismatchError`, which the service catches and re-throws as `409 Conflict`. The client must re-fetch and retry.

### PDF Generation

`GET /api/cases/:id/notice.pdf` builds an HTML string server-side from case + loan + customer data, then hands it to a headless Chromium instance (Puppeteer) which renders it to A4 PDF. The browser is launched fresh per request and always closed in a `finally` block. In Docker, `PUPPETEER_EXECUTABLE_PATH` is set to the system Chromium binary to avoid bundling a second Chromium inside the container.

---

## Rule Engine

### Storage

Rules live in a single JSON file: **`apps/api/src/config/rules.json`**

No code changes are required to add, edit, or reorder rules — only the JSON file needs to be updated and the server restarted.

### How It Works

At module initialization `RulesService.onModuleInit()` loads the JSON, casts it to `Rule<R>[]`, and sorts by `priority` ascending (lower number = evaluated first, wins on first match).

When `POST /api/cases/:id/assign` is called:
1. `CasesService` fetches the case (with customer relation)
2. `RulesService.evaluate(caseEntity)` iterates rules in priority order, returning the **first match**
3. The matched rule's `action` is applied to the case in a transaction
4. A `RuleDecision` audit record is saved in the **same transaction** with `matchedRuleId` and `reason`
5. The response includes the decision details for the caller

### Rule Schema

```json
{
  "id": "UNIQUE_RULE_ID",
  "priority": 1,
  "condition": {
    "field": "dpd",
    "operator": "gt",
    "value": 30
  },
  "action": {
    "stage": "LEGAL",
    "assignedTo": "Legal"
  },
  "description": "Human-readable reason stored in audit log"
}
```

**`condition.field`** — dot-notation path resolved against the case entity, e.g. `"dpd"` or `"customer.riskScore"`

**`condition.operator`** — one of:

| Operator | Meaning | `value` type |
|----------|---------|--------------|
| `gt` | greater than | number |
| `gte` | greater than or equal | number |
| `lt` | less than | number |
| `lte` | less than or equal | number |
| `eq` | equal | any |
| `neq` | not equal | any |
| `between` | inclusive range | `[min, max]` |
| `in` | value in set | array |

**`action`** — sets `stage` (`SOFT`/`HARD`/`LEGAL`) and `assignedTo` (agent/group name) on the case

**`priority`** — lower number = evaluated first; evaluation stops at the first match (no accumulation)

### Current Rules (in priority order)

| Priority | Rule ID | Condition | Result |
|----------|---------|-----------|--------|
| 1 | `RISK_GT_80_OVERRIDE` | `customer.riskScore > 80` | HARD stage → SeniorAgent |
| 2 | `DPD_GT_30` | `dpd > 30` | LEGAL stage → Legal |
| 3 | `DPD_8_30` | `8 ≤ dpd ≤ 30` | HARD stage → Tier2 |
| 4 | `DPD_1_7` | `1 ≤ dpd ≤ 7` | SOFT stage → Tier1 |

### Adding or Editing Rules

1. Open `apps/api/src/config/rules.json`
2. Add a new object or edit an existing one
3. Choose a unique `id` and set `priority` (lower = checked first)
4. Restart the API (`yarn dev:api` or redeploy)

Example — add a rule that escalates high-risk customers even at low DPD:

```json
{
  "id": "HIGH_RISK_EARLY_ESCALATION",
  "priority": 1,
  "condition": {
    "field": "customer.riskScore",
    "operator": "gte",
    "value": 90
  },
  "action": { "stage": "HARD", "assignedTo": "SeniorAgent" },
  "description": "riskScore >= 90 -> immediate SeniorAgent escalation"
}
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/cases` | Create a case (requires `customerId`, `loanId`) |
| `GET` | `/api/cases` | List cases — supports `status`, `stage`, `assignedTo`, `dpdMin`, `dpdMax`, `page`, `limit`, `sortOrder` |
| `GET` | `/api/cases/kpis` | Open case count, resolved today, average DPD |
| `GET` | `/api/cases/:id` | Case detail with last 10 action logs and latest rule decision |
| `POST` | `/api/cases/:id/actions` | Log a contact action; sets status to IN_PROGRESS; PAID outcome resolves the case |
| `POST` | `/api/cases/:id/assign` | Run rule engine, update stage/assignee, save audit record |
| `GET` | `/api/cases/:id/notice.pdf` | Download A4 PDF payment notice |
| `GET` | `/api/customers` | List all customers |
| `GET` | `/api/loans` | List all loans |
| `GET` | `/api/metrics` | Case counts by status/stage, avg DPD, daily activity |
| `GET` | `/api/health` | Health check (used by Docker) |

Full interactive docs available at `/api/docs` (Swagger UI).

---

## Trade-offs & Design Decisions

### Rules in JSON file vs. database table
Storing rules in a static JSON file keeps the rule engine simple and version-controlled alongside code. The trade-off is that adding a rule requires a file edit and server restart — there is no live admin UI. Moving rules to a database table with a CRUD API would enable runtime updates but adds a management interface, schema complexity, and the need to invalidate the in-memory rule cache.

### TypeORM vs. Prisma
TypeORM was chosen for its native NestJS integration (`@nestjs/typeorm`) and built-in optimistic locking via `@VersionColumn`. The downside is a more verbose query builder compared to Prisma's typed client, and manual entity class definitions that can drift from the DB schema.

### Optimistic locking vs. pessimistic locking
Optimistic locking (version field) was chosen because concurrent assignment conflicts are expected to be rare. It avoids holding DB-level row locks during the evaluation round-trip. The cost is a 409 error that callers must handle with a re-fetch and retry.

### Puppeteer in the same container
Running Puppeteer alongside the API avoids a separate service and simplifies deployment. The cost is a significantly larger Docker image (~300 MB for Chromium). A production system would likely extract PDF generation into a dedicated microservice or use a lighter renderer (WeasyPrint, wkhtmltopdf, or a SaaS PDF API).

### No authentication
JWT/session auth is not implemented — this is an interview assignment scoped to core case management logic. In production, `@nestjs/passport` with a JWT strategy and `@UseGuards(AuthGuard('jwt'))` on each controller would be added.

### Seed data design
The seed truncates all tables with `RESTART IDENTITY CASCADE` and re-seeds deterministically. This makes local development repeatable but means running `yarn seed` is destructive. A production seed would be additive and idempotent.
