# bohol_resources
The goal of the project is to create a directory of professionals and organizations that can help in building almost anything, this is to promote that it's possible to build something in Bohol.

## Requirements

- Node.js v22.x (or newer in the 22 line)
- Docker
- npm (bundled with Node.js) or your preferred package manager
- Supabase CLI (installed globally)
  - macOS: `brew install supabase/tap/supabase`
  - or via npm: `npm i -g supabase`
- Git

## Project structure

- `app/`: Main application source.
  - `app/src/routes/`: UI pages and server-side endpoints.
  - `app/src/lib/`: Shared client/server utilities, components, and types.
  - `app/static/`: Public static assets.
- `supabase/`: Database and backend SQL resources.
  - Migrations, table definitions, and SQL functions are tracked here.
  - Configure local/project settings in `supabase/config.toml`.


## Getting started

### 1) Clone and install dependencies
```bash
git clone <repo-url>
cd bohol_resources/app
npm install
```

### 2) Supabase setup

You have two options: run Supabase locally, or use your own remote Supabase project.

— Local (recommended if your machine supports Docker):
```bash
# From repo root
supabase init   # if not already initialized
supabase start  # starts local services via Docker

# Push database schema and run migrations
supabase db push --local

# Generate TypeScript types for strict type safety
supabase gen types typescript --schema public > app/src/lib/supabase.types.ts
```

— Remote (if you cannot run locally):
```bash
# Create a project in Supabase Dashboard, then link:
supabase link --project-ref <your-project-ref>

# Push your schema/migrations to remote
supabase db push

# Generate types from remote schema
supabase gen types typescript --schema public > app/src/lib/supabase.types.ts
```

Configure your app environment variables with your project credentials (URL and anon key). For SvelteKit, create `app/.env` and add:
```bash
PUBLIC_SUPABASE_URL="https://<your-project>.supabase.co"
PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
```

### 3) Run the app
```bash
cd app
npm run dev
```

## Contributing (GitFlow)

Follow this lightweight GitFlow to keep changes organized and releases smooth.

### Branch model
- `main`: Always production-ready. Only release and hotfix merges land here.
- `develop`: Integration branch for ongoing work. Feature branches merge here via PR.
- `feature/<short-slug>`: New work branches off `develop`.
- `release/<version>`: Prep for a release (docs, versioning, final fixes) branched from `develop`.
- `hotfix/<version>`: Emergency fixes branched from `main`.

### Prerequisites
- Git installed and configured (`git --version`)
- A GitHub account with access to this repository

### Standard workflow
1. Open or pick an Issue describing the change.
2. Branch from `develop`:
   - `git checkout develop`
   - `git pull origin develop`
   - `git checkout -b feature/<short-slug>`
3. Make small, incremental commits using Conventional Commits (see below).
4. Push your branch and open a Pull Request into `develop`.
5. Ensure:
   - All checks pass (CI, lint, tests if applicable)
   - At least 1 approval from a maintainer
   - PR follows the checklist below
6. Prefer "Squash and merge" to keep history tidy. The squash title should reflect the change scope.

### Commit message convention (Conventional Commits)
Use a clear type and short imperative subject, e.g.:
- `feat: add provider type filter to directory`
- `fix: correct broken link in README`
- `docs: add GitFlow contribution guide`
- `refactor: simplify search query builder`
- `chore: update dependencies`

Format: `<type>(optional-scope): <short summary>`

### Pull Request checklist
- Scope is focused and references related Issue(s)
- Title is clear and descriptive
- Description explains the what/why/how
- Screenshots or recordings for UI/UX changes (if applicable)
- Tests updated or added (if applicable)
- Documentation updated (README or docs as needed)

### Release process
1. Create release branch from `develop`:
   - `git checkout develop && git pull`
   - `git checkout -b release/<version>` (e.g., `release/0.2.0`)
2. Stabilize: only bug fixes, docs, version bump, and changelog.
3. Open PRs from `release/<version>` into both `main` and `develop`.
4. After merge to `main`, tag the release:
   - `git tag -a v<version> -m "Release v<version>"`
   - `git push origin v<version>`

### Hotfixes
1. Branch from `main`: `git checkout -b hotfix/<version>` (e.g., `hotfix/0.2.1`)
2. Implement the fix, bump patch version, update changelog.
3. Open PRs from `hotfix/<version>` into `main` and `develop` (to avoid regressions).

### Keep your branch up to date
- Rebase regularly to keep a clean history:
  - `git fetch origin`
  - `git checkout feature/<short-slug>`
  - `git rebase origin/develop`
  - Resolve conflicts if any, then `git push --force-with-lease`

### Common commands
```bash
# Clone and set upstream
git clone <repo-url>
cd bohol_resources
git remote -v

# Start a feature
git checkout develop && git pull
git checkout -b feature/<short-slug>

# Commit
git add -A
git commit -m "feat: concise, descriptive summary"

# Push and PR
git push -u origin feature/<short-slug>

# Update feature branch with latest develop
git fetch origin
git rebase origin/develop
git push --force-with-lease
```

If you'd like a dedicated, longer guide, consider adding a `CONTRIBUTING.md` later. For now, the above is the source of truth.

### Type safety with Supabase

Always keep TypeScript types in sync with your Supabase schema to maintain strict type safety.

Generate types locally:

```bash
# From repo root
supabase gen types typescript --schema public > app/src/lib/supabase.types.ts
```

Run this after any migration/table/function change in `supabase/` and commit the updated types file.
