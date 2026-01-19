# Agent Notes for motorcycle-group-app

This repository is an Nx workspace with a NestJS API and a Jest-based e2e test project.
Use this guide when making changes so tooling, style, and conventions stay consistent.

## Quick project map
- api/ - NestJS application
- api/src/app - feature modules (auth, users, etc.)
- api-e2e/ - Jest end-to-end tests targeting the API
- dist/ - build output (ignored by lint)

## Core commands (Nx)
Use `npx nx <target> <project>` for all tasks. There are no npm scripts.

### Build
- Build the API (production): `npx nx build api`
- Build the API (development): `npx nx build api --configuration=development`

### Serve
- Serve API (development default): `npx nx serve api`
- Serve API (production build): `npx nx serve api --configuration=production`

### Lint
- Lint API: `npx nx lint api`
- Lint e2e tests: `npx nx lint api-e2e`

### Test
- Run e2e suite: `npx nx e2e api-e2e`
- Run a single e2e file:
  `npx nx e2e api-e2e --testPathPattern=api-e2e/src/api/api.spec.ts`
- Run a single e2e test name:
  `npx nx e2e api-e2e --testNamePattern="should return a message"`

### Useful Nx commands
- List projects: `npx nx show projects`
- Graph workspace: `npx nx graph`

## Tooling expectations
- Package manager: npm (no pnpm/yarn config in repo).
- TypeScript: workspace base is `tsconfig.base.json`.
- Lint: ESLint flat config (`eslint.config.mjs`) with Nx presets.
- Format: Prettier with `singleQuote: true`.

## Code style guidelines

### Imports
- Group imports by origin:
  1) Node built-ins
  2) External packages
  3) Internal app modules
- Keep each group separated by a single blank line.
- Prefer named imports and avoid default exports in app modules.

### Formatting
- Follow Prettier defaults; single quotes are enforced.
- Use 2 spaces for indentation (as formatted by Prettier).
- Keep lines reasonably short; wrap long argument lists.
- Do not introduce non-ASCII characters unless the file already uses them.

### TypeScript and types
- Prefer explicit return types for public service methods and exported functions.
- Use `Promise<...>` for async methods rather than relying on inference.
- Avoid `any`; use `unknown` plus narrowing when needed.
- Use DTOs for request/response shapes and validate with class-validator.

### Naming conventions
- Classes: `PascalCase` (Nest providers, controllers, modules).
- Methods, variables: `camelCase`.
- Files: `kebab-case` for module files and folders; `*.dto.ts`, `*.entity.ts`.
- Constants: `UPPER_SNAKE_CASE` for environment/config constants.

### NestJS structure
- Keep modules thin; orchestrate services in providers.
- Controllers should only map HTTP to service calls.
- Services encapsulate business logic and database access.
- Entities belong in their feature folders (see `api/src/app/users`).
- DTOs live under `dto/` folders and reflect validation rules.

### Error handling
- Use NestJS HTTP exceptions (`BadRequestException`, `ConflictException`, etc.).
- Prefer early validation and explicit error messages.
- Avoid swallowing errors; rethrow or wrap with context.
- Keep error messages safe for clients (no secrets or stack traces).

### Data access and security
- Use TypeORM repositories injected via `@InjectRepository`.
- Hash passwords with bcrypt before persistence (see `UsersService`).
- Do not log secrets or credentials.

### Testing conventions
- E2E tests use Jest with `api-e2e/jest.config.ts`.
- Tests live under `api-e2e/src/**` and use `.spec.ts`.
- Keep tests independent; ensure setup and teardown live under `api-e2e/src/support`.

### Lint and module boundaries
- Nx enforces module boundaries; do not reach across features in ad-hoc ways.
- Avoid importing from build output or `dist`.

## File-by-file notes
- `api/src/main.ts` sets the global prefix `api` and listens on PORT 3000 by default.
- `api/webpack.config.js` uses NxAppWebpackPlugin for node builds.
- `api-e2e/src/api/api.spec.ts` is the starter e2e test.

## Adding new code
- Update or add DTOs for new endpoints.
- Wire new controllers and providers in the feature module.
- Add tests under `api-e2e/src` for new API behaviors.

## Repository rules (Cursor/Copilot)
- No Cursor or Copilot instruction files were found in this repo.

## Quick checklist for agents
- Run `npx nx lint api` after modifying API code.
- Run `npx nx e2e api-e2e` for changes that affect API behavior.
- Keep formatting aligned with Prettier (single quotes).
- Preserve NestJS module boundaries and dependency injection patterns.
