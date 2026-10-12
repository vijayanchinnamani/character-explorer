import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';

function route(data: Record<string, unknown> = {}): ActivatedRouteSnapshot {
  return { data } as unknown as ActivatedRouteSnapshot;
}

function state(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

describe('route guards', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => sessionStorage.clear());

  const run = (guard: typeof authGuard, r: ActivatedRouteSnapshot, s: RouterStateSnapshot) =>
    TestBed.runInInjectionContext(() => guard(r, s));

  describe('authGuard', () => {
    it('redirects to /role-select (with returnUrl) when no role is chosen', () => {
      const result = run(authGuard, route(), state('/characters?page=2')) as UrlTree;

      expect(router.serializeUrl(result)).toBe('/role-select?returnUrl=%2Fcharacters%3Fpage%3D2');
    });

    it('allows navigation once a role is chosen', () => {
      auth.setRole('viewer');

      expect(run(authGuard, route(), state('/characters'))).toBeTrue();
    });
  });

  describe('roleGuard', () => {
    const adminOnly = { roles: ['admin'] };

    it('allows an Admin', () => {
      auth.setRole('admin');

      expect(run(roleGuard, route(adminOnly), state('/characters/1'))).toBeTrue();
    });

    it('sends a Viewer to /access-denied and reports the attempted route', () => {
      auth.setRole('viewer');

      const result = run(roleGuard, route(adminOnly), state('/characters/1')) as UrlTree;

      expect(router.serializeUrl(result)).toBe('/access-denied?from=%2Fcharacters%2F1');
    });

    it('denies everyone when the route lists no roles', () => {
      auth.setRole('admin');

      const result = run(roleGuard, route(), state('/characters/1'));

      expect(result).toBeInstanceOf(UrlTree);
    });
  });
});
