import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RoleSelect } from './role-select';

describe('RoleSelect', () => {
  let navigateByUrl: jasmine.Spy;

  function setup(returnUrl?: string) {
    sessionStorage.clear();
    TestBed.configureTestingModule({ imports: [RoleSelect], providers: [provideRouter([])] });
    navigateByUrl = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);

    const fixture = TestBed.createComponent(RoleSelect);
    if (returnUrl !== undefined) {
      fixture.componentRef.setInput('returnUrl', returnUrl);
    }
    fixture.detectChanges();
    return fixture;
  }

  function clickRole(root: HTMLElement, label: 'Admin' | 'Viewer'): void {
    const button = Array.from(root.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(`Continue as ${label}`),
    );
    expect(button).withContext(`"Continue as ${label}" button`).toBeDefined();
    button!.click();
  }

  afterEach(() => sessionStorage.clear());

  it('stores the chosen role and goes to the character list by default', () => {
    const fixture = setup();

    clickRole(fixture.nativeElement, 'Admin');

    expect(TestBed.inject(AuthService).role()).toBe('admin');
    expect(navigateByUrl).toHaveBeenCalledWith('/characters');
  });

  it('returns to the originally requested internal URL', () => {
    const fixture = setup('/characters/5');

    clickRole(fixture.nativeElement, 'Admin');

    expect(navigateByUrl).toHaveBeenCalledWith('/characters/5');
  });

  [
    ['a protocol-relative URL', '//evil.example.com'],
    ['an absolute external URL', 'https://evil.example.com'],
    ['a javascript: URL', 'javascript:alert(1)'],
    ['the role-select page itself', '/role-select?returnUrl=%2Fcharacters'],
    ['an empty value', ''],
  ].forEach(([label, url]) => {
    it(`ignores ${label} as a return URL`, () => {
      const fixture = setup(url);

      clickRole(fixture.nativeElement, 'Viewer');

      expect(TestBed.inject(AuthService).role()).toBe('viewer');
      expect(navigateByUrl).toHaveBeenCalledWith('/characters');
    });
  });
});
