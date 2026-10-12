import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/rick-morty.models';
import { AuthService } from '../services/auth.service';

/**
 * Allows the route only for the roles listed in `data: { roles: [...] }`.
 * Everyone else lands on the access-denied page, which shows what they tried to open.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['roles'] as Role[] | undefined) ?? [];

  return auth.hasAnyRole(allowedRoles)
    ? true
    : router.createUrlTree(['/access-denied'], { queryParams: { from: state.url } });
};
