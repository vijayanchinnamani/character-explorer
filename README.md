# Character Explorer (Angular 20 POC)

A Rick & Morty **Character Explorer** built on the public [Rick and Morty API](https://rickandmortyapi.com/documentation).
Browse and search characters, open a character to see its episodes, with simulated **Admin / Viewer** authorization.

- Angular `20.3`, standalone components, signals, new control flow (`@if` / `@for` / `@switch`)
- Angular Material `20.2`
- State: signals + services (no NgRx)
- Tests: Karma + Jasmine (services, guards, filter logic and the main components)

## Documentation

| Guide | For |
| --- | --- |
| [docs/README.md](docs/README.md) | Index, requirements checklist, at-a-glance facts |
| [docs/architecture.md](docs/architecture.md) | Structure, routing/roles, state, data flow, decisions, limitations |
| [docs/user-guide.md](docs/user-guide.md) | Using the app (Admin and Viewer) |
| [docs/developer-guide.md](docs/developer-guide.md) | Run, build, test, conventions, extending |
| [docs/scripts-and-troubleshooting.md](docs/scripts-and-troubleshooting.md) | macOS setup/start/stop scripts and fixing problems |

## Run it

### Easiest: the helper scripts (macOS)

```bash
bash setup.sh     # first time: installs Node (if needed) + dependencies, starts the app, opens Chrome
bash start.sh     # afterwards: start in the background and open Chrome
bash stop.sh      # stop it
bash status.sh    # is it running? on which port? (shows the log tail if it is not)
```

Each has a double-clickable `*.command` twin (`Setup.command`, `Start.command`, ...).
`START-HERE.md` is the plain-language guide to hand to someone else.

- **Node.js:** uses a compatible Node already on the Mac; otherwise downloads Node 22 LTS (checksum-verified)
  into `.tools/node` inside this folder. Nothing is installed system-wide; deleting the folder removes it.
- **Runs in the background** in its own session (closing the Terminal window does not stop it);
  PID, port and log live in `.run/`. If port 4200 is busy it picks the next free port.
- `NO_BROWSER=1 bash start.sh` starts without opening a browser.
- `start.sh` re-runs `npm ci` automatically when `package-lock.json` changed.
- Packaging for a friend (only in the original POC folder): `../package-for-sharing.sh` creates `../share/character-explorer.zip`
  (without `node_modules`, caches or `.tools`).

### Manually

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build -> dist/
npm test           # Karma; CI: npx ng test --watch=false --browsers=ChromeHeadless
```

> **Node version:** Angular CLI 20 requires Node `^20.19.0 || ^22.12.0 || >=24.0.0` (declared in
> `package.json` `engines`). This project was developed and tested on Node `26.8.2`.

## Features (mapped to the requirements)

| Requirement | Where |
| --- | --- |
| List **or** grid view of characters, with name / status / species / gender / total episodes | `features/characters/character-list`, `character-card` |
| Avatar (optional) | `character-card` |
| Preserve selection state between navigation (optional) | page + search in URL query params; view mode and last-opened character in `ExplorerStateService` |
| Global search bar filtering by name | header in `app.ts` (debounced 300 ms, server-side `?name=`) |
| Character details on a dedicated route with episodes table (`name`, `air_date`, `episode`) | `features/characters/character-details` |
| Client-side episode filtering by name (free-form text) | `episode-filter.ts` |
| Roles Admin / Viewer, simulated | `features/role-select`, `AuthService` |
| Admin: all routes; Viewer: character list only | `authGuard`, `roleGuard` (route `data: { roles: ['admin'] }`) |
| Clear error message when access is denied | `features/access-denied` |

## Routes

| Path | Who | Notes |
| --- | --- | --- |
| `/role-select` | anyone | Pick Admin or Viewer (stored in `sessionStorage`, survives refresh) |
| `/characters` | any role | `?name=<search>&page=<n>` |
| `/characters/:id` | **Admin only** | Viewer is redirected to `/access-denied?from=<route>` |
| `/access-denied` | any role | Explains what was blocked and why |

No role selected -> redirected to `/role-select` and returned to the originally requested URL afterwards.

## API usage

| Use case | Endpoint |
| --- | --- |
| List / search / paginate | `GET /character?name={name}&page={number}` |
| Character for details route (works on refresh / deep link) | `GET /character/{id}` |
| Episodes of a character | `GET /episode/{id1,id2,...}` (one request) |

Handled API quirks (`core/services/rick-morty-api.service.ts`):

- Searching with no matches (or an out-of-range page) returns **HTTP 404**; it is shown as "No characters found", not as an error.
- `/episode/1` returns a single object while `/episode/1,2` returns an array; both are normalized to an array.
- "Total episodes" is `character.episode.length`, so the list needs no extra requests.

## Project structure

```
src/app/
  core/
    models/        API + domain types
    services/      AuthService, ExplorerStateService, RickMortyApiService
    guards/        authGuard, roleGuard
    storage.ts     safe sessionStorage helpers
  features/
    role-select/
    access-denied/
    characters/
      character-card/      presentational card (grid + list layout)
      character-list/      list page, pagination, view toggle
      character-details/   profile + episodes table + filter
  app.ts|html|scss         shell: toolbar, global search, role badge
  testing/                 test-only data builders
scripts/lib.sh             shared helpers for setup/start/stop/status
```

## Notes

- Authentication is intentionally simulated (per the POC brief): the role is just a value chosen on `/role-select`.
  Guards run client-side only, so this is a UX demonstration, not security.
- The initial bundle budget in `angular.json` was raised to 900 kB (warning) / 1.5 MB (error) because of Angular Material.
