# Character Explorer: Documentation

Character Explorer is an Angular 20 proof of concept that lets users browse and search characters from the
public [Rick and Morty API](https://rickandmortyapi.com/documentation), open a character to see the
episodes it appears in, and demonstrates simulated **Admin / Viewer** authorization.

## Where to start

| I want to... | Read |
| --- | --- |
| Understand how the app is built and why | [Architecture & design](architecture.md) |
| Use the app (or demo it) | [User guide](user-guide.md) |
| Run, change, test or extend the code | [Developer guide](developer-guide.md) |
| Install it on a Mac, or fix a problem starting it | [Scripts & troubleshooting](scripts-and-troubleshooting.md) |

For a two-minute start, see [`START-HERE.md`](../START-HERE.md) in the project root.

## At a glance

| | |
| --- | --- |
| Framework | Angular 20.3 (standalone components, signals, new control flow) |
| UI | Angular Material 20.2 (Material 3 theme, Azure/Blue) |
| State | Signals + injectable services (no NgRx) |
| Data | Rick and Morty REST API, via `HttpClient` |
| Tests | Karma + Jasmine, run in headless Chrome |
| Node.js | `^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0` (Angular CLI 20 requirement) |
| Platform for scripts | macOS 11 or newer |

## Requirements implemented

| Requirement (from the POC brief) | Status | Where |
| --- | --- | --- |
| Characters in a list or grid view | Done | `character-list`, `character-card` |
| Name, status, species, gender, total episodes per character | Done | `character-card` |
| Avatar (optional) | Done | `character-card` |
| Preserve selection state between navigation (optional) | Done | URL query params + `ExplorerStateService` |
| Global search bar filtering by name | Done | `app.ts` / `app.html` (toolbar) |
| Character details on a dedicated route | Done | `character-details`, route `/characters/:id` |
| Episodes table: `name`, `air_date`, `episode` | Done | `character-details` |
| Client-side filtering by episode name | Done | `episode-filter.ts` |
| Two roles: Admin and Viewer | Done | `AuthService`, `role-select` |
| Admin can access all routes, Viewer only the character list | Done | `authGuard`, `roleGuard` |
| Clear error message when access is denied | Done | `access-denied` |
| Roles simulated by a hardcoded value | Done | chosen on `/role-select` |

## Documentation conventions

- Paths are relative to the project folder (`character-explorer/`).
- Diagrams are [Mermaid](https://mermaid.js.org/); they render in GitHub and VS Code (with a Mermaid extension).
- File and class names follow what the Angular 20 CLI generates, except services, which keep the `.service.ts` suffix.
