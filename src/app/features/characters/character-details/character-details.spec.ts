import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ExplorerStateService } from '../../../core/services/explorer-state.service';
import { API_URL } from '../../../core/services/rick-morty-api.service';
import { makeCharacter, makeEpisode } from '../../../testing/fixtures';
import { CharacterDetails } from './character-details';

describe('CharacterDetails', () => {
  let http: HttpTestingController;

  function setup(id: string): ComponentFixture<CharacterDetails> {
    TestBed.configureTestingModule({
      imports: [CharacterDetails],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(CharacterDetails);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    return fixture;
  }

  const root = (fixture: ComponentFixture<CharacterDetails>) => fixture.nativeElement as HTMLElement;
  const rowNames = (fixture: ComponentFixture<CharacterDetails>) =>
    Array.from(root(fixture).querySelectorAll('tr[mat-row] td:first-child')).map((td) => td.textContent?.trim());

  afterEach(() => http.verify());

  function loadRick(fixture: ComponentFixture<CharacterDetails>): void {
    http.expectOne(`${API_URL}/character/1`).flush(makeCharacter(1, { name: 'Rick Sanchez' }));
    http
      .expectOne(`${API_URL}/episode/1,2`)
      .flush([
        makeEpisode(1, { name: 'Pilot', air_date: 'December 2, 2013', episode: 'S01E01' }),
        makeEpisode(2, { name: 'Lawnmower Dog', air_date: 'December 9, 2013', episode: 'S01E02' }),
      ]);
    fixture.detectChanges();
  }

  it('shows the character and a table of its episodes with name, air_date and episode headers', () => {
    const fixture = setup('1');
    loadRick(fixture);

    expect(root(fixture).querySelector('h1')?.textContent).toContain('Rick Sanchez');
    const headers = Array.from(root(fixture).querySelectorAll('th')).map((th) => th.textContent?.trim());
    expect(headers).toEqual(['name', 'air_date', 'episode']);
    expect(rowNames(fixture)).toEqual(['Pilot', 'Lawnmower Dog']);
    expect(TestBed.inject(ExplorerStateService).selectedCharacterId()).toBe(1);
  });

  it('filters the episodes client-side by name without calling the API again', () => {
    const fixture = setup('1');
    loadRick(fixture);

    const input = root(fixture).querySelector('input') as HTMLInputElement;
    input.value = 'lawn';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(rowNames(fixture)).toEqual(['Lawnmower Dog']);
    expect(root(fixture).querySelector('.count')?.textContent).toContain('Showing 1 of 2');

    input.value = 'nothing like this';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(rowNames(fixture)).toEqual([]);
    expect(root(fixture).querySelector('.no-data')?.textContent).toContain('No episodes match');
  });

  it('shows "Character not found" when the API answers 404', () => {
    const fixture = setup('999');
    http
      .expectOne(`${API_URL}/character/999`)
      .flush({ error: 'Character not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(root(fixture).querySelector('[role="alert"]')?.textContent).toContain('Character not found');
  });

  it('treats a non-numeric id as not found without calling the API', () => {
    const fixture = setup('abc');
    fixture.detectChanges();

    expect(root(fixture).querySelector('[role="alert"]')?.textContent).toContain('Character not found');
    http.expectNone(() => true);
  });

  it('shows an error with Retry on a server failure', () => {
    const fixture = setup('1');
    http.expectOne(`${API_URL}/character/1`).flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const alert = root(fixture).querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Could not load this character');
    expect(alert?.querySelector('button')).not.toBeNull();
  });
});
