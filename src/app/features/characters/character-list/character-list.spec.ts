import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Role } from '../../../core/models/rick-morty.models';
import { AuthService } from '../../../core/services/auth.service';
import { API_URL } from '../../../core/services/rick-morty-api.service';
import { makeCharacter, makePage } from '../../../testing/fixtures';
import { CharacterList } from './character-list';

describe('CharacterList', () => {
  let http: HttpTestingController;

  function setup(role: Role, inputs: { name?: string; page?: string } = {}): ComponentFixture<CharacterList> {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [CharacterList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(AuthService).setRole(role);
    http = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(CharacterList);
    Object.entries(inputs).forEach(([key, value]) => fixture.componentRef.setInput(key, value));
    fixture.detectChanges();
    return fixture;
  }

  const request = () => http.expectOne((r) => r.url === `${API_URL}/character`);
  const root = (fixture: ComponentFixture<CharacterList>) => fixture.nativeElement as HTMLElement;

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('requests the page and name from the query params', () => {
    const fixture = setup('admin', { name: 'rick', page: '3' });

    const req = request();
    expect(req.request.params.get('name')).toBe('rick');
    expect(req.request.params.get('page')).toBe('3');
    req.flush(makePage([makeCharacter(1)], 1));
    fixture.detectChanges();
  });

  it('Admin sees every character as a link to its details', () => {
    const fixture = setup('admin');
    request().flush(makePage([makeCharacter(1), makeCharacter(2)], 826));
    fixture.detectChanges();

    const links = Array.from(root(fixture).querySelectorAll('a.card')).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/characters/1', '/characters/2']);
    expect(root(fixture).querySelector('.summary')?.textContent).toContain('826 characters');
    expect(root(fixture).querySelector('mat-paginator')).not.toBeNull();
  });

  it('Viewer sees the characters but cannot open details', () => {
    const fixture = setup('viewer');
    request().flush(makePage([makeCharacter(1), makeCharacter(2)]));
    fixture.detectChanges();

    expect(root(fixture).querySelectorAll('a.card').length).toBe(0);
    expect(root(fixture).querySelectorAll('.card.disabled').length).toBe(2);
    expect(root(fixture).querySelector('.notice')?.textContent).toContain('Viewer');
  });

  it('shows "No characters found" (not an error) when the API answers 404', () => {
    const fixture = setup('admin', { name: 'zzzz' });
    request().flush({ error: 'There is nothing here' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    const text = root(fixture).textContent ?? '';
    expect(text).toContain('No characters found');
    expect(text).toContain('zzzz');
    expect(root(fixture).querySelector('[role="alert"]')).toBeNull();
  });

  it('offers a way back to the first page when the requested page is out of range', () => {
    const fixture = setup('admin', { page: '99' });
    request().flush({ error: 'There is nothing here' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    const text = root(fixture).textContent ?? '';
    expect(text).toContain('There are no characters on page 99');
    expect(text).toContain('Go to first page');
  });

  it('shows an error with Retry on a server failure and reloads when retried', () => {
    const fixture = setup('admin');
    request().flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const alert = root(fixture).querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Could not load characters');

    (alert!.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();

    request().flush(makePage([makeCharacter(1)]));
    fixture.detectChanges();
    expect(root(fixture).querySelectorAll('a.card').length).toBe(1);
  });
});
