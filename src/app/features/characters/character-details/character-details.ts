import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { catchError, map, of, startWith, switchMap, tap } from 'rxjs';
import { Character, Episode } from '../../../core/models/rick-morty.models';
import { ExplorerStateService } from '../../../core/services/explorer-state.service';
import { RickMortyApiService } from '../../../core/services/rick-morty-api.service';
import { filterEpisodesByName } from './episode-filter';

type DetailsState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error' }
  | { status: 'ready'; character: Character; episodes: Episode[] };

@Component({
  selector: 'app-character-details',
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './character-details.html',
  styleUrl: './character-details.scss',
})
export class CharacterDetails {
  private readonly api = inject(RickMortyApiService);
  private readonly explorerState = inject(ExplorerStateService);

  /** `:id` route param, bound via withComponentInputBinding. */
  readonly id = input.required<string>();

  protected readonly displayedColumns = ['name', 'air_date', 'episode'] as const;
  protected readonly filter = signal('');
  protected readonly backQuery = this.explorerState.listQuery;

  private readonly retryCount = signal(0);

  protected readonly state = toSignal(
    toObservable(computed(() => ({ id: this.id(), attempt: this.retryCount() }))).pipe(
      switchMap(({ id }) => {
        const characterId = Number(id);
        if (!Number.isInteger(characterId) || characterId < 1) {
          return of<DetailsState>({ status: 'not-found' });
        }

        return this.api.getCharacterWithEpisodes(characterId).pipe(
          tap(() => this.explorerState.selectedCharacterId.set(characterId)),
          map(({ character, episodes }): DetailsState => ({ status: 'ready', character, episodes })),
          startWith<DetailsState>({ status: 'loading' }),
          catchError((error: unknown) =>
            of<DetailsState>({
              status: error instanceof HttpErrorResponse && error.status === 404 ? 'not-found' : 'error',
            }),
          ),
        );
      }),
    ),
    { initialValue: { status: 'loading' } as DetailsState },
  );

  protected readonly ready = computed(() => {
    const state = this.state();
    return state.status === 'ready' ? state : null;
  });

  protected readonly filteredEpisodes = computed(() => {
    const ready = this.ready();
    return ready ? filterEpisodesByName(ready.episodes, this.filter()) : [];
  });

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  protected retry(): void {
    this.retryCount.update((count) => count + 1);
  }
}
