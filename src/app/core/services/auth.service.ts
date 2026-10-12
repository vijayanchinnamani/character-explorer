import { computed, Injectable, signal } from '@angular/core';
import { Role } from '../models/rick-morty.models';
import { readSession, writeSession } from '../storage';

export const ROLE_STORAGE_KEY = 'character-explorer.role';

function isRole(value: string | null): value is Role {
  return value === 'admin' || value === 'viewer';
}

/**
 * Simulated authorization: there is no real authentication, the user simply picks a role.
 * The role is kept in sessionStorage so a browser refresh does not lose it.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _role = signal<Role | null>(this.restoreRole());

  readonly role = this._role.asReadonly();
  readonly isAuthenticated = computed(() => this._role() !== null);
  readonly isAdmin = computed(() => this._role() === 'admin');

  setRole(role: Role): void {
    this._role.set(role);
    writeSession(ROLE_STORAGE_KEY, role);
  }

  clearRole(): void {
    this._role.set(null);
    writeSession(ROLE_STORAGE_KEY, null);
  }

  hasAnyRole(roles: readonly Role[]): boolean {
    const role = this._role();
    return role !== null && roles.includes(role);
  }

  private restoreRole(): Role | null {
    const stored = readSession(ROLE_STORAGE_KEY);
    return isRole(stored) ? stored : null;
  }
}
