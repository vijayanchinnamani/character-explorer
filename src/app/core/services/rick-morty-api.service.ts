import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Character, CharacterWithEpisodes, Episode, Page } from '../models/rick-morty.models';

export const API_URL = 'https://rickandmortyapi.com/api';

const EMPTY_PAGE: Page<never> = {
  info: { count: 0, pages: 0, next: null, prev: null },
  results: [],
};

/** "https://rickandmortyapi.com/api/episode/12" -> 12 (invalid entries are dropped). */
export function episodeIdsFromUrls(urls: readonly string[]): number[] {
  return urls
    .map((url) => Number(url.split('/').pop()))
    .filter((id) => Number.isInteger(id) && id > 0);
}

@Injectable({ providedIn: 'root' })
export class RickMortyApiService {
  private readonly http = inject(HttpClient);

  /**
   * GET /character?name={name}&page={number}
   * The API answers 404 when nothing matches (or the page is out of range);
   * that is a normal "no results" case here, not an error.
   */
  getCharacters(name: string, page: number): Observable<Page<Character>> {
    let params = new HttpParams().set('page', page);
    const term = name.trim();
    if (term) {
      params = params.set('name', term);
    }

    return this.http.get<Page<Character>>(`${API_URL}/character`, { params }).pipe(
      catchError((error: unknown) =>
        error instanceof HttpErrorResponse && error.status === 404
          ? of(EMPTY_PAGE)
          : throwError(() => error),
      ),
    );
  }

  /** GET /character/{id} - used so the details route works on refresh / direct link. */
  getCharacter(id: number): Observable<Character> {
    return this.http.get<Character>(`${API_URL}/character/${id}`);
  }

  /**
   * GET /episode/{id,id,...}
   * The API returns a single object for one id and an array for several; always return an array.
   */
  getEpisodes(ids: readonly number[]): Observable<Episode[]> {
    if (ids.length === 0) {
      return of([]);
    }

    return this.http
      .get<Episode | Episode[]>(`${API_URL}/episode/${ids.join(',')}`)
      .pipe(map((response) => (Array.isArray(response) ? response : [response])));
  }

  getCharacterWithEpisodes(id: number): Observable<CharacterWithEpisodes> {
    return this.getCharacter(id).pipe(
      switchMap((character) =>
        this.getEpisodes(episodeIdsFromUrls(character.episode)).pipe(
          map((episodes) => ({ character, episodes })),
        ),
      ),
    );
  }
}
