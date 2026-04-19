# CLAUDE.md — nested.money Monorepo

## 1. Overview

**nested.money** is a children's investment platform that lets parents create savings goals for their children and invest in mutual funds on their behalf. The product handles KYC, goal-based SIP/lumpsum investing, portfolio tracking, and payment flows.

| Component | Purpose |
|-----------|---------|
| `server` | Java Spring Boot API — business logic, auth, fintech integrations, scheduled jobs |
| `mobile-app` | React Native + Expo — primary parent-facing app |
| `admin-client` | Next.js — internal admin portal for operations/support |

---

## 2. Monorepo Structure

```
/nested-app
├── server/                   # Spring Boot backend (Java 21)
│   ├── src/main/java/com/nested/app/
│   │   ├── controllers/      # REST endpoints
│   │   ├── services/         # Business logic
│   │   ├── repository/       # JPA repositories
│   │   ├── entity/           # JPA entities
│   │   ├── dto/              # Request/response objects
│   │   ├── mapper/           # Entity ↔ DTO mappers
│   │   ├── config/           # Spring config beans
│   │   ├── filter/           # Servlet filters (TraceId, auth)
│   │   ├── jobs/             # Quartz scheduled jobs
│   │   ├── events/           # Application events & listeners
│   │   ├── exception/        # GlobalExceptionHandler + custom exceptions
│   │   ├── enums/            # Shared enumerations
│   │   ├── annotation/       # Custom annotations (@AdminOnly, etc.)
│   │   ├── client/           # WebClient wrappers (Cybrilla, BulkPe, etc.)
│   │   ├── firebase/         # Firebase Admin SDK utilities
│   │   ├── buckets/          # AWS S3 bucket abstractions
│   │   └── utils/            # Shared utilities
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/     # Flyway SQL migrations (currently disabled)
│   ├── Dockerfile
│   └── build.gradle.kts
│
├── mobile-app/               # React Native + Expo (SDK 53)
│   ├── app/                  # Expo Router file-based routes
│   │   ├── (tabs)/           # Bottom tab navigator
│   │   ├── goal/             # Goal flows
│   │   ├── child/            # Child management
│   │   ├── basket/           # Basket investment flows
│   │   ├── kyc/              # KYC onboarding
│   │   ├── payment/          # Payment flows
│   │   ├── nominees/         # Nominee management
│   │   └── redirects/        # Deep link redirect handlers
│   ├── components/           # Shared UI components
│   ├── api/                  # Axios API clients + per-domain API functions
│   ├── atoms/                # Jotai atoms (global state)
│   ├── providers/            # React context providers
│   ├── hooks/                # Custom React hooks
│   ├── services/             # Non-API services (mfaService, etc.)
│   ├── types/                # TypeScript type definitions
│   ├── constants/            # App-wide constants
│   └── utils/                # Utility functions
│
├── admin-client/             # Next.js 15 admin portal
│   ├── app/                  # Next.js App Router pages
│   │   ├── users/            # User management
│   │   ├── funds/            # Fund management
│   │   ├── baskets/          # Basket management
│   │   ├── education/        # Education goal management
│   │   ├── actions/          # Server actions
│   │   └── api/              # API route handlers
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # shadcn/ui primitives (DO NOT hand-edit)
│   │   └── layout/           # Layout components
│   ├── contexts/             # React contexts (AuthContext)
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilities, API client, export utils
│   └── types/                # TypeScript types
│
└── docs/                     # Architecture docs and runbooks
```

---

## 3. Tech Stack

### Backend (`server`)
- **Language**: Java 21
- **Framework**: Spring Boot 3.5.5
- **Database**: PostgreSQL (via Spring Data JPA + Hibernate)
- **Migrations**: Flyway (SQL in `db/migration/`, **enabled** — all schema changes must go through versioned migration files)
- **Scheduler**: Quartz (clustered JDBC job store)
- **Caching**: Caffeine (in-memory)
- **Auth**: Auth0 (OAuth2 Resource Server — JWT RS256), Firebase Admin SDK for push
- **Resilience**: Resilience4j (CircuitBreaker + RateLimiter on Cybrilla/FinPrimitives clients)
- **HTTP Client**: Spring WebFlux WebClient (reactive, for external APIs)
- **Logging**: Logstash Logback encoder (JSON, Grafana/Loki-ready) + MDC trace IDs via `TraceIdFilter`
- **External Integrations**: Cybrilla/FinPrimitives (MF orders), BulkPe (payments), Twilio (SMS/WhatsApp), SendGrid (email), AWS S3, Auth0 Management API, MaxMind GeoIP2
- **Docs**: Springdoc OpenAPI at `/public/swagger`

### Mobile (`mobile-app`)
- **Framework**: React Native 0.79.5 + Expo SDK 53
- **Router**: Expo Router v5 (file-based, similar to Next.js App Router)
- **State**: Jotai v2 (atomic) + `jotai-tanstack-query` for server state atoms
- **Data Fetching**: TanStack Query v5
- **HTTP**: Axios with request/response interceptors (auth token + MFA token injection)
- **UI**: UI Kitten + Eva Design + Lucide React Native icons
- **Auth**: Auth0 (`react-native-auth0`) + Facebook SDK
- **Analytics/Crash**: Firebase Analytics, Crashlytics, Performance
- **Storage**: `expo-secure-store` (tokens), AsyncStorage (non-sensitive)
- **Storybook**: On-device component stories
- **Package Manager**: npm

### Admin Client (`admin-client`)
- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui (Radix UI primitives) + Tailwind CSS v3
- **Auth**: Auth0 (`@auth0/nextjs-auth0`)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Notifications**: Sonner (toast)
- **Package Manager**: bun

### Infrastructure
- **Backend**: Deployed via GitHub Actions (no Docker in active use)
- **Admin**: Deployed on Vercel (auto-deploys on push to main)
- **Mobile**: EAS Build → manual submission to Google Play / App Store
- **Observability**: Actuator endpoints (`/health`, `/metrics`, `/prometheus`), JSON structured logs

---

## 4. Development Setup

### Prerequisites
- Java 21 (`sdk install java 21`)
- Node.js 20+ and npm (mobile)
- Bun (admin: `curl -fsSL https://bun.sh/install | bash`)
- Docker + Docker Compose
- PostgreSQL 15+ (local or Docker)
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI for builds (`npm install -g eas-cli`)

### Backend setup
```bash
cd server
# Edit .env with local DB credentials and third-party API keys
./gradlew bootRun
# Server starts on http://localhost:8080
# Swagger: http://localhost:8080/public/swagger
```

**Minimum required env vars for local dev:**
```
DATABASE_URL=jdbc:postgresql://localhost:5432/nested
DB_USER=admin
DB_PASS=admin
AUTH0_DOMAIN=<your-dev-tenant>.us.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
FIREBASE_SERVICE_ACCOUNT_PATH=file:/path/to/serviceAccountKey.json
```

### Mobile setup
```bash
cd mobile-app
npm install
npx expo start              # starts dev server
npx expo run:android        # for native build on Android
npx expo run:ios            # for native build on iOS
```

### Admin Client setup
```bash
cd admin-client
bun install
bun dev                     # starts on http://localhost:3000
```

### Environment variable rules
- Backend: `application.properties` reads from env vars with fallback defaults. Load via `.env` file (Spring dotenv via `spring.config.import=optional:file:.env[.properties]`).
- Mobile: All public env vars must be prefixed `EXPO_PUBLIC_`. Private keys go in EAS secrets, never in the repo.
- Admin: Use `.env.local` (gitignored). Auth0 vars required: `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`.

---

## 5. Common Commands

### Backend
```bash
./gradlew bootRun                    # run dev server
./gradlew build                      # build (includes tests)
./gradlew build -x test              # build, skip tests
./gradlew test                       # run tests
./gradlew bootJar                    # produce runnable JAR
```

### Mobile
```bash
npm start                            # Expo dev server
npm run android                      # run on Android emulator/device
npm run ios                          # run on iOS simulator
npm run lint                         # ESLint
npm run storybook-generate           # regenerate Storybook story index
npm run preview:android              # EAS preview build
npm run production:android           # EAS production build
```

### Admin Client
```bash
bun dev                              # dev server (localhost:3000)
bun build                            # production build
bun lint                             # ESLint via next lint
```

---

## 6. Coding Standards & Conventions

### Naming
- **Java**: PascalCase classes, camelCase methods/fields, UPPER_SNAKE_CASE constants, `*Service`/`*Controller`/`*Repository`/`*Entity`/`*DTO` suffixes
- **TypeScript (mobile/admin)**: PascalCase components, camelCase functions/variables, `*API` suffix for API modules, `use*` prefix for hooks
- **Database**: `snake_case` table and column names
- **API routes**: `kebab-case` path segments, versioned (`/api/v1/...`)

### File structure rules
- One class per Java file; filename matches class name exactly
- React components: one component per file, filename matches component name
- Co-locate test files next to source in backend (`src/test/java/...` mirrors `src/main/java/...`)

### API design
- All endpoints versioned under `/api/v1/`
- Admin-only endpoints under `/api/v1/admin/` and annotated `@AdminOnly`
- Request/response bodies use DTO classes — never expose entities directly
- Use `@Validated` on controllers; validate DTOs with Jakarta Bean Validation

### Error handling
- Backend: throw domain exceptions (`ResourceNotFoundException`, `IllegalArgumentException`, etc.); `GlobalExceptionHandler` normalizes all responses
- Error response shape: `{ timestamp, status, error, message }`
- MFA errors: `{ timestamp, status, error: "MFA_REQUIRED", message, errorCode }` with HTTP 403
- Mobile: handle `isMfaRequired: true` errors from the Axios interceptor to show MFA modal

### Logging (backend)
- Use `@Slf4j` (Lombok) — never `System.out.println`
- Log at `INFO` for business events, `ERROR` with stack trace for exceptions, `DEBUG` for diagnostic details
- MDC `traceId` is injected by `TraceIdFilter` — always present in structured logs

---

## 7. Backend Guidelines

### Package layout (under `com.nested.app`)
| Package | Responsibility |
|---------|---------------|
| `controllers` | HTTP routing, input parsing, delegation to services |
| `services` | Business logic; interface + impl pattern (`FooService` / `FooServiceImpl`) |
| `repository` | Spring Data JPA `JpaRepository` interfaces only |
| `entity` | `@Entity` classes; use Lombok `@Data`/`@Builder`/`@NoArgsConstructor` |
| `dto` | Request/Response POJOs; `*Request` / `*Response` / `*DTO` suffix |
| `mapper` | Manual or MapStruct mappers; no mapping logic in controllers/services |
| `jobs` | Quartz `Job` implementations; register triggers in config |
| `client` | WebClient-based external API wrappers (circuit breaker applied here) |
| `config` | `@Configuration` beans — security, web, caching, AWS, etc. |
| `exception` | Custom exception classes + `GlobalExceptionHandler` |
| `filter` | `OncePerRequestFilter` implementations |
| `annotation` | Custom meta-annotations (`@AdminOnly`, etc.) |

### Controller conventions
```java
@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/resource")
@Tag(name = "...", description = "...")  // Swagger
public class ResourceController {
    private final ResourceService resourceService;

    @GetMapping("/{id}")
    @Operation(summary = "...")
    public ResponseEntity<ResourceDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }
}
```

### Auth & authorization
- JWT tokens issued by Auth0, validated by Spring Security OAuth2 Resource Server (RS256)
- Custom `@AdminOnly` annotation enforces admin role at method level
- User identity extracted from `SecurityContextHolder` in services via context utilities
- Firebase Admin SDK used for push notifications — **not** for primary auth

### Scheduled jobs
- Quartz clustered JDBC store — jobs survive restarts and run on exactly one node
- All job beans in `jobs/` package; register `JobDetail` + `Trigger` beans in config
- `spring.quartz.jdbc.initialize-schema` controls schema creation (set to `never` in prod — schema must pre-exist)

### External API clients
- Use `client/` package; wrap with Resilience4j `@CircuitBreaker` and `@RateLimiter`
- Named instances: `finprimitives`, `cybrilla` (configured in `application.properties`)
- All HTTP calls are non-blocking (WebClient/Reactor)

---

## 8. Mobile App Guidelines

### Navigation
- **Expo Router** (file-based). Routes mirror the `app/` directory structure.
- Bottom tabs: `app/(tabs)/` — add new tabs here by creating route files
- Dynamic segments: `[param_id]` folder naming
- Deep link redirects handled in `app/redirects/`

### State management
- **Server state**: TanStack Query via `jotai-tanstack-query` — prefer query atoms over standalone `useQuery` hooks where state must be shared globally
- **Local/global UI state**: Jotai atoms in `atoms/` directory; group atoms by domain (`goals.ts`, `cart.ts`, etc.)
- **Auth state**: Auth0 session via `react-native-auth0`; MFA state via `services/mfaService`

### API layer
- All API calls go through `api/client.ts` (configured Axios instance)
- `api.interceptors.request` injects MFA token from SecureStore
- `api.interceptors.response` handles `MFA_REQUIRED` (403) — sets `isMfaRequired: true` on the rejected error
- Per-domain API files in `api/` (`goalApi.ts`, `userApi.ts`, etc.) — group by backend resource
- `EXPO_PUBLIC_API_URL` env var controls the base URL

### Component conventions
- Feature components in `components/<domain>/` (e.g., `components/goal/`, `components/sip/`)
- Generic UI primitives in `components/ui/`
- Use UI Kitten components for consistent design; add custom variants in `components/v2/`
- All components should have a Storybook story if they are reusable

### Storage
- Auth tokens / MFA tokens: **`expo-secure-store`** only — never AsyncStorage
- Non-sensitive user preferences: AsyncStorage

---

## 9. Admin Client Guidelines

### Component structure
- Page components: `app/<section>/page.tsx`
- Shared components: `components/` — split into `ui/` (shadcn primitives) and domain-specific
- `components/ui/` is **auto-generated by shadcn/ui CLI** — do not hand-edit; re-run `bunx shadcn add` to update
- Layout shell: `components/AppSidebar.tsx` + `components/LayoutContent.tsx`

### Data fetching
- Server Components for initial data loads where possible (Next.js App Router)
- Client Components (`"use client"`) for interactive data tables, forms, real-time updates
- API calls through `lib/api-client.ts` — centralized fetch wrapper
- Server Actions in `app/actions/` for form mutations

### UI consistency
- Tailwind CSS only for styling — no inline styles, no CSS modules
- Radix UI / shadcn components for all interactive primitives (dialogs, dropdowns, selects)
- Recharts for all data visualizations
- Framer Motion for transitions — keep subtle; avoid heavy animations in data-dense views
- Toast notifications via Sonner (`sonner` toast, not `@radix-ui/react-toast` directly)

### Auth
- `@auth0/nextjs-auth0` handles session management
- Protect pages via `AuthContext` + `LayoutContent` redirect logic
- Unauthorized access → `app/unauthorized/page.tsx`

---

## 10. Shared Code

There is no dedicated `shared/` package. Cross-cutting concerns are handled by:
- **Types**: Each project owns its own TypeScript types; mobile `types/` and admin `types/` are not shared
- **API contract**: Backend DTOs define the contract; frontend types are manually kept in sync
- **Constants**: Domain constants duplicated intentionally — do not create implicit coupling between mobile and admin

---

## 11. Git Workflow

### Branch naming
```
feat/<short-description>       # new feature
fix/<short-description>        # bug fix
chore/<short-description>      # maintenance, deps, config
hotfix/<short-description>     # production hotfix
```

### Commit format
```
<type>: <short imperative description>

# Examples:
feat: add SIP cycle reconciler
fix: SIP setup UI issue
chore: bump expo sdk to 53
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`

### PR guidelines
- Target `main` for all PRs
- One logical change per PR — avoid mixing feature + refactor
- Include a description of what changed and why
- For backend schema changes, include the migration SQL in the PR description even if Flyway is disabled

---

## 12. Testing Strategy

### Backend
- **Unit tests**: JUnit 5 + Spring Boot Test in `src/test/java/`; mock external clients
- **Integration tests**: `@SpringBootTest` with test DB (H2 or Testcontainers PostgreSQL)
- Test files mirror source package structure under `com.nested.app`
- Run: `./gradlew test`

### Mobile
- **Unit tests**: Jest + `jest-expo` preset
- **Component tests**: Storybook on-device stories for visual verification
- Run: `npx jest` (config in `package.json`)

### Admin
- No test suite currently configured — add with `@testing-library/react` + `jest` if needed

### Performance
- k6 load tests in `server/k6-tests/` for critical API endpoints

---

## 13. CI/CD

- **Backend**: GitHub Actions pipeline — builds the Spring Boot JAR and deploys to the server. The `Dockerfile` exists but is not part of the active deployment flow.
- **Admin**: Vercel — auto-deploys on push to `main`. Preview deployments on PRs. Configure env vars in the Vercel dashboard, not in the repo.
- **Mobile**: EAS Build for APK/IPA, then **manually submitted** to Google Play / App Store via the respective consoles.
  - Preview builds: `npm run preview:android`
  - Production builds: `npm run production:android`
- Environment separation: `SPRING_PROFILES_ACTIVE` controls Spring profile (`dev`, `staging`, `prod`)

---

## 14. Security & Secrets

### Rules
- **NEVER commit**: `.env`, `serviceAccountKey.json`, `google-services.json`, `GoogleService-Info.plist`, any `*secret*` or `*key*` file
- `google-services.json` and `GoogleService-Info.plist` are in the mobile repo root but should be gitignored in production — treat as sensitive
- Firebase service account (`serviceAccountKey.json`) is **mounted at runtime** on EC2, not baked into the Docker image
- API keys/secrets loaded exclusively from environment variables — defaults in `application.properties` are for local dev only

### Env var management
- Backend: `.env` file (gitignored), real secrets in EC2 environment or secrets manager
- Mobile: `EXPO_PUBLIC_*` vars in `.env`; private secrets in EAS Secrets dashboard
- Admin: `.env.local` (gitignored) for Auth0 credentials

### Auth0 specifics
- Never expose `AUTH0_CLIENT_SECRET` to the mobile app — only `CLIENT_ID` is safe client-side
- JWT audience and issuer must match across mobile app and backend resource server config

---

## 15. AI Assistant Guidelines

### What you CAN do
- Add new controllers, services, repositories following existing patterns
- Add new Expo Router screens in `app/` following existing route structure
- Add new shadcn/ui components via CLI convention (`bunx shadcn add <component>`)
- Add new Jotai atoms or TanStack Query API functions
- Write unit tests for existing services
- Modify DTO classes and their corresponding mappers
- Add new Quartz jobs following the pattern in `jobs/`
- Modify `application.properties` for non-secret config values

### What you MUST NOT do
- **Never modify** `components/ui/` in admin-client — shadcn-generated, regenerate via CLI
- **Never modify existing** Flyway migration files — they have already been applied to production
- **Never change** `spring.jpa.hibernate.ddl-auto` — Flyway owns schema management now
- **Never commit** secrets, API keys, service account files, or `.env` files
- **Never modify** Auth0 JWT validation config (`spring.security.oauth2.*`) without understanding the full auth chain
- **Never change** Quartz `isClustered=true` — required for multi-node deployments
- **Never delete** existing Flyway migration files in `db/migration/` — they are version history even if Flyway is disabled

### Database / schema changes
1. All schema changes **must** go through a new Flyway migration file (`V<N>__description.sql`) — Flyway is enabled and runs on startup
2. Name migrations: `V<N>__<verb>_<noun>.sql` (e.g., `V19__add_status_to_orders.sql`)
3. All migrations are **forward-only** — never modify an existing migration file; add a new one to correct mistakes
4. Test schema changes against a local PostgreSQL instance before proposing
5. `spring.quartz.jdbc.initialize-schema` controls Quartz table creation — set to `never` in prod (schema pre-exists)

### API changes
- Adding new endpoints: safe, follow controller/service/repository pattern
- Modifying existing endpoint request/response shapes: **breaking change** — coordinate with mobile and admin teams
- Changing HTTP status codes or error response shapes: **breaking change** — the mobile Axios interceptor depends on specific error shapes (especially `errorCode: "MFA_REQUIRED"` on 403)

### Safe code generation checklist
- [ ] Does the new code follow the existing package structure?
- [ ] Are secrets read from env vars (not hardcoded)?
- [ ] Does any new entity change require a Flyway migration?
- [ ] Does any API change break the mobile or admin client contract?
- [ ] Are new external API calls wrapped with circuit breaker?

---

## 16. Known Constraints & Gotchas

### Backend
- **Flyway enabled**: `spring.flyway.enabled=true` — Flyway runs on every startup and applies pending migrations. Schema changes **must** be in a versioned migration file; do not rely on Hibernate `ddl-auto` for schema changes.
- **Quartz clustering**: Jobs run on one node only. Do not add `@Scheduled` annotations for tasks that are already in Quartz — they will run on every node.
- **Circuit breaker named instances**: `finprimitives` and `cybrilla` — if you add a new external client, register a new named instance in `application.properties`.
- **MFA token**: Passed as `X-MFA-Token` header. Certain endpoints require it; the mobile interceptor injects it automatically. Backend validates via `MfaController` flow.
- **Trace IDs**: Custom `TraceIdFilter` injects `traceId` into MDC. Do not add Micrometer/Sleuth — it's explicitly excluded.
- **HikariCP pool**: Max 5 connections (`maximum-pool-size=5`) — sized for small EC2 instances. Don't create additional datasource beans without adjusting pool config.

### Mobile
- **Expo Router**: All navigation is file-based. Adding a new screen = creating a new file in `app/`. Do not use `@react-navigation` `Stack.Navigator` directly — let Expo Router manage it.
- **Jotai + TanStack Query**: Use `jotai-tanstack-query` atoms for server state that needs to be accessed from multiple screens. Use plain `useQuery` for local-only fetches.
- **MFA flow**: After a 403 `MFA_REQUIRED` response, the UI must show an MFA modal and retry with the new token. The Axios interceptor sets `isMfaRequired: true` on the error — check for this flag.
- **`google-services.json`**: Required at build time for Firebase. Never check in production credentials.
- **Storybook**: `(storybook)` route group in `app/` is the Storybook entry. Do not delete it.

### Admin
- **bun lockfile**: Use `bun install`, not `npm install`. Mixing package managers corrupts `bun.lockb`.
- **Auth0 session**: Admin auth uses `@auth0/nextjs-auth0` server-side session. Client-side auth state comes from `AuthContext`. Don't bypass `LayoutContent` auth checks.
- **shadcn/ui**: Adding a new component: `bunx shadcn@latest add <name>`. Editing generated files in `components/ui/` will be overwritten on next `shadcn add`.

### General
- **Domain**: `nested.money` — the product name is "Nested"
- **Fintech compliance**: Any change to order creation, KYC, or payment flows must be reviewed carefully — these touch regulated financial workflows (Cybrilla/FinPrimitives MF platform)
- **No shared code package**: Mobile and admin types are maintained separately — keep them in sync manually when backend DTOs change
