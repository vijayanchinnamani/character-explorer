# Developer guide

Everything you need to run, change, test and extend the project. For the "why", see
[Architecture & design](architecture.md).

## 1. Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | `^20.19.0`, `^22.12.0` or `>=24.0.0` | Same range as Angular CLI 20 (`engines` in `package.json`). Developed on Node 26.8.2. |
| npm | 8 or newer (ships with Node) | |
| Google Chrome | any recent | Used by `ng test` (ChromeHeadless) and by the helper scripts |

Do not have Node? On macOS, `bash setup.sh` downloads a private copy (see
[Scripts & troubleshooting](scripts-and-troubleshooting.md)).

## 2. Run, build, test

```bash
npm install          # or: npm ci (exact versions from package-lock.json)
npm start            # dev server, http://localhost:4200, live reload
npm run build        # production build into dist/character-explorer
npm test             # Karma + Jasmine in a browser window, watch mode
npx ng test --watch=false --browsers=ChromeHeadless   # one-off, as used in CI
```

The helper scripts (`setup.sh`, `start.sh`, `stop.sh`, `status.sh`) run the same dev server in the background.

## 3. Project layout

```
character-explorer/
  src/
    index.html                 Loads Roboto and Material Icons from Google Fonts
    main.ts                    bootstrapApplication(App, appConfig)
    styles.scss                Material 3 theme (mat.theme), global resets
    app/                       See "Architecture & design" for the full tree
  angular.json                 Build config, bundle budgets (900 kB warn / 1.5 MB error)
  package.json                 Scripts, dependencies, engines
  scripts/lib.sh               Shared shell helpers for setup/start/stop/status
  setup.sh start.sh stop.sh status.sh   macOS helper scripts (+ *.command double-click twins)
  docs/                        This documentation
  START-HERE.md                Plain-language guide for someone receiving the zip
```

## 4. Conventions

- **Standalone components only**, no NgModules. Dependencies are listed in each component's `imports`.
- **Signals first**: `signal`, `computed`, `input()`, `effect`. RxJS is used where it is the right tool
  (HTTP, debounce, `switchMap`), bridged with `toSignal` / `toObservable`.
- **New control flow** (`@if`, `@for`, `@switch`, `@let`) in templates.
- **Query/route params bind to inputs** (`withComponentInputBinding`), so components never inject
  `ActivatedRoute`.
- **Files:** `name.ts`, `name.html`, `name.scss`, `name.spec.ts`. Services are `name.service.ts`.
- **Types:** strict TypeScript; API shapes live in `core/models`.
- **Styling:** use Material system tokens (`var(--mat-sys-...)`) rather than hard-coded colours, so theming
  stays consistent. Component styles are scoped; global styles are only in `styles.scss`.
- **Formatting:** Prettier settings are in `package.json` (100 columns, single quotes).
- **Side effects:** only `RickMortyApiService` calls the network; only `AuthService` and
  `ExplorerStateService` touch `sessionStorage` (through `core/storage.ts`).

## 5. How the main pieces work

### Adding a query-param-driven page

1. Add the route with `canActivate` guards in `app.routes.ts`.
2. Declare `input<string | undefined>()` for each param in the component.
3. Build a `computed` from the inputs, then
   `toSignal(toObservable(query).pipe(switchMap(...)))` for the data (see `character-list.ts`).

### Restricting a route to roles

```ts
{
  path: 'reports',
  component: Reports,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['admin'] },
}
```

To add a **new role**: extend the `Role` type in `core/models/rick-morty.models.ts`, add an option to
`RoleSelect.options`, update `isRole` in `auth.service.ts`, and list the role in the relevant routes' `data.roles`.

### Calling a new API endpoint

Add a method to `RickMortyApiService`, normalize quirks there (404s, single-vs-array responses), and add a spec
with `HttpTestingController`. Components should never use `HttpClient` directly.

### Remembering something across navigation

- Should survive refresh or be shareable? Put it in the **URL** (query param).
- Per-tab preference? A signal in `ExplorerStateService`, mirrored with `readSession` / `writeSession`.

## 6. Testing

Framework: Karma + Jasmine (Angular's default), `HttpTestingController` for HTTP, `TestBed` for components.

| Spec | What it protects |
| --- | --- |
| `core/services/auth.service.spec.ts` | Role set/clear, sessionStorage restore, invalid stored values |
| `core/guards/guards.spec.ts` | `authGuard` redirect with `returnUrl`; `roleGuard` allow/deny and `from` param |
| `core/services/rick-morty-api.service.spec.ts` | Query params, 404 to empty page, other errors propagate, single/array episode normalisation, id parsing |
| `features/characters/character-details/episode-filter.spec.ts` | Name-only, case-insensitive filter; no mutation |
| `features/characters/character-details/character-details.spec.ts` | Table headers and rows, client-side filter, not-found, invalid id, error + Retry |
| `features/characters/character-list/character-list.spec.ts` | Admin links, Viewer locked cards, 404 empty state, out-of-range page, error + Retry |
| `features/characters/character-card/character-card.spec.ts` | Shown fields, alt text, link vs locked, selected |
| `features/role-select/role-select.spec.ts` | Role stored, safe `returnUrl` handling (external/protocol-relative/javascript URLs rejected) |
| `app.spec.ts` | Shell renders; search and role badge appear only after a role is set |

Test data builders (`makeCharacter`, `makeEpisode`, `makePage`) are in `src/app/testing/fixtures.ts`.

Tips:

- Clear `sessionStorage` in `beforeEach`/`afterEach` for anything touching roles.
- Component specs set inputs with `fixture.componentRef.setInput(...)` **before** the first `detectChanges()`;
  after a signal change, call `detectChanges()` again so effects run before expecting a request.
- Call `http.verify()` in `afterEach` to catch unexpected requests.

## 7. Building for production

```bash
npm run build
```

Output is in `dist/character-explorer/browser`. It is a static site: serve it with any static server and
make sure unknown paths fall back to `index.html` (the app uses the HTML5 router), for example:

```bash
npx serve -s dist/character-explorer/browser
```

## 8. Dependency and version policy

- Angular packages are on the 20.x line; `@angular/material` and `@angular/cdk` on 20.2.x.
- Keep `@angular/*` major versions aligned. When upgrading, use `ng update`, then re-run the tests and the
  helper-script smoke test.
- If the `engines` range changes, update the compatibility check in `scripts/lib.sh` (`node_is_compatible`)
  and the pinned portable Node (`NODE_VERSION` and the two SHA-256 values).

## 9. Common development issues

| Symptom | Cause / fix |
| --- | --- |
| `ng` warns about an unsupported Node version | Use Node 20.19+, 22.12+ or 24+ |
| Icons show as words (e.g. "search") | Material Icons font did not load (offline or blocked CDN) |
| Tests cannot start a browser | Install Google Chrome, or set `CHROME_BIN` to a Chromium binary |
| Port 4200 already in use | `ng serve --port 4300`, or stop the other process; the helper scripts pick a free port by themselves |
| Search box and URL seem out of sync after a code change | Hard-refresh; check `App`'s URL-to-box effect and `applySearch` |
