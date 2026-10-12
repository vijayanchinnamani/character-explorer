export type CharacterStatus = 'Alive' | 'Dead' | 'unknown';

export interface Character {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  /** Episode resource URLs, e.g. https://rickandmortyapi.com/api/episode/1 */
  episode: string[];
  url: string;
  created: string;
}

export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
}

export interface PageInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface Page<T> {
  info: PageInfo;
  results: T[];
}

export interface CharacterWithEpisodes {
  character: Character;
  episodes: Episode[];
}

export type Role = 'admin' | 'viewer';

export type ViewMode = 'grid' | 'list';
