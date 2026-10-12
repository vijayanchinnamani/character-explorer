import { TestBed } from '@angular/core/testing';
import { AuthService, ROLE_STORAGE_KEY } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  function create(): AuthService {
    TestBed.resetTestingModule();
    return TestBed.inject(AuthService);
  }

  it('starts without a role', () => {
    const auth = create();

    expect(auth.role()).toBeNull();
    expect(auth.isAuthenticated()).toBeFalse();
    expect(auth.isAdmin()).toBeFalse();
  });

  it('sets the role and persists it to sessionStorage', () => {
    const auth = create();

    auth.setRole('admin');

    expect(auth.role()).toBe('admin');
    expect(auth.isAuthenticated()).toBeTrue();
    expect(auth.isAdmin()).toBeTrue();
    expect(sessionStorage.getItem(ROLE_STORAGE_KEY)).toBe('admin');
  });

  it('restores a stored role (browser refresh)', () => {
    sessionStorage.setItem(ROLE_STORAGE_KEY, 'viewer');

    const auth = create();

    expect(auth.role()).toBe('viewer');
    expect(auth.isAdmin()).toBeFalse();
  });

  it('ignores an invalid stored value', () => {
    sessionStorage.setItem(ROLE_STORAGE_KEY, 'superuser');

    expect(create().role()).toBeNull();
  });

  it('clears the role from memory and storage', () => {
    const auth = create();
    auth.setRole('viewer');

    auth.clearRole();

    expect(auth.role()).toBeNull();
    expect(sessionStorage.getItem(ROLE_STORAGE_KEY)).toBeNull();
  });

  it('checks membership with hasAnyRole', () => {
    const auth = create();
    expect(auth.hasAnyRole(['admin'])).toBeFalse();

    auth.setRole('viewer');

    expect(auth.hasAnyRole(['admin'])).toBeFalse();
    expect(auth.hasAnyRole(['admin', 'viewer'])).toBeTrue();
  });
});
