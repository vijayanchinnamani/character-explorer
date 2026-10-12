import { Character, Episode, Page } from '../core/models/rick-morty.models';
import { API_URL } from '../core/services/rick-morty-api.service';

/** Test-only builders for API-shaped data. Not imported by application code. */
export function makeEpisode(id: number, overrides: Partial<Episode> = {}): Episode {
  return {
    id,
    name: `Episode ${id}`,
    air_date: 'December 2, 2013',
    episode: `S01E${String(id).padStart(2, '0')}`,
    characters: [],
    url: `${API_URL}/episode/${id}`,
    created: '2017-11-10T12:56:33.798Z',
    ...overrides,
  };
}

export function makeCharacter(id: number, overrides: Partial<Character> = {}): Character {
  return {
    id,
    name: `Character ${id}`,
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: { name: 'Earth (C-137)', url: '' },
    location: { name: 'Citadel of Ricks', url: '' },
    image: `${API_URL}/character/avatar/${id}.jpeg`,
    episode: [`${API_URL}/episode/1`, `${API_URL}/episode/2`],
    url: `${API_URL}/character/${id}`,
    created: '2017-11-04T18:48:46.250Z',
    ...overrides,
  };
}

export function makePage<T>(results: T[], count = results.length): Page<T> {
  return { info: { count, pages: Math.max(1, Math.ceil(count / 20)), next: null, prev: null }, results };
}
