import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Character, Episode, Page } from '../models/rick-morty.models';
import { API_URL, episodeIdsFromUrls, RickMortyApiService } from './rick-morty-api.service';

const episode = (id: number): Episode => ({
  id,
  name: `Episode ${id}`,
  air_date: 'December 2, 2013',
  episode: `S01E0${id}`,
  characters: [],
  url: `${API_URL}/episode/${id}`,
  created: '2017-11-10T12:56:33.798Z',
});

const character: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth (C-137)', url: '' },
  location: { name: 'Citadel of Ricks', url: '' },
  image: `${API_URL}/character/avatar/1.jpeg`,
  episode: [`${API_URL}/episode/1`, `${API_URL}/episode/2`],
  url: `${API_URL}/character/1`,
  created: '2017-11-04T18:48:46.250Z',
};

describe('episodeIdsFromUrls', () => {
  it('extracts numeric ids and drops invalid entries', () => {
    expect(episodeIdsFromUrls([`${API_URL}/episode/1`, `${API_URL}/episode/42`, 'nonsense', ''])).toEqual([1, 42]);
  });
});

describe('RickMortyApiService', () => {
  let service: RickMortyApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RickMortyApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('getCharacters', () => {
    it('requests the page without a name filter when the term is blank', () => {
      service.getCharacters('   ', 3).subscribe();

      const req = http.expectOne((r) => r.url === `${API_URL}/character`);
      expect(req.request.params.get('page')).toBe('3');
      expect(req.request.params.has('name')).toBeFalse();
      req.flush({ info: { count: 0, pages: 0, next: null, prev: null }, results: [] });
    });

    it('sends the trimmed name and page', () => {
      service.getCharacters(' rick ', 2).subscribe();

      const req = http.expectOne((r) => r.url === `${API_URL}/character`);
      expect(req.request.params.get('name')).toBe('rick');
      expect(req.request.params.get('page')).toBe('2');
      req.flush({ info: { count: 0, pages: 0, next: null, prev: null }, results: [] });
    });

    it('returns the API page on success', () => {
      let result: Page<Character> | undefined;
      service.getCharacters('rick', 1).subscribe((page) => (result = page));

      http
        .expectOne((r) => r.url === `${API_URL}/character`)
        .flush({ info: { count: 1, pages: 1, next: null, prev: null }, results: [character] });

      expect(result?.results).toEqual([character]);
      expect(result?.info.count).toBe(1);
    });

    it('maps the API 404 "nothing here" response to an empty page', () => {
      let result: Page<Character> | undefined;
      let failed = false;
      service.getCharacters('zzzz', 1).subscribe({
        next: (page) => (result = page),
        error: () => (failed = true),
      });

      http
        .expectOne((r) => r.url === `${API_URL}/character`)
        .flush({ error: 'There is nothing here' }, { status: 404, statusText: 'Not Found' });

      expect(failed).toBeFalse();
      expect(result?.results).toEqual([]);
      expect(result?.info.count).toBe(0);
    });

    it('propagates non-404 errors', () => {
      let failed = false;
      service.getCharacters('rick', 1).subscribe({ error: () => (failed = true) });

      http
        .expectOne((r) => r.url === `${API_URL}/character`)
        .flush('boom', { status: 500, statusText: 'Server Error' });

      expect(failed).toBeTrue();
    });
  });

  describe('getEpisodes', () => {
    it('does not call the API when there are no ids', () => {
      let result: Episode[] | undefined;
      service.getEpisodes([]).subscribe((episodes) => (result = episodes));

      expect(result).toEqual([]);
      http.expectNone(() => true);
    });

    it('wraps the single-object response in an array', () => {
      let result: Episode[] | undefined;
      service.getEpisodes([1]).subscribe((episodes) => (result = episodes));

      http.expectOne(`${API_URL}/episode/1`).flush(episode(1));

      expect(result).toEqual([episode(1)]);
    });

    it('passes through the array response for several ids in one request', () => {
      let result: Episode[] | undefined;
      service.getEpisodes([1, 2]).subscribe((episodes) => (result = episodes));

      http.expectOne(`${API_URL}/episode/1,2`).flush([episode(1), episode(2)]);

      expect(result).toEqual([episode(1), episode(2)]);
    });
  });

  describe('getCharacterWithEpisodes', () => {
    it('loads the character, then its episodes by id', () => {
      let result: { character: Character; episodes: Episode[] } | undefined;
      service.getCharacterWithEpisodes(1).subscribe((value) => (result = value));

      http.expectOne(`${API_URL}/character/1`).flush(character);
      http.expectOne(`${API_URL}/episode/1,2`).flush([episode(1), episode(2)]);

      expect(result?.character.name).toBe('Rick Sanchez');
      expect(result?.episodes.length).toBe(2);
    });
  });
});
