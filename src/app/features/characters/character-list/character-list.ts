import { ViewportScroller } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { Character, Page, ViewMode } from '../../../core/models/rick-morty.models';
import { AuthService } from '../../../core/services/auth.service';
import { ExplorerStateService } from '../../../core/services/explorer-state.service';
import { RickMortyApiService } from '../../../core/services/rick-morty-api.service';
import { CharacterCard } from '../character-card/character-card';

type ListState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; page: Page<Character> };

@Component({
  selector: 'app-character-list',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    CharacterCard,
  ],
  templateUrl: './character-list.html',
  styleUrl: './character-list.scss',
})
export class CharacterList {
  private readonly api = inject(RickMortyApiService);
  private readonly router = inject(Router);
  private readonly viewport = inject(ViewportScroller);
  private readonly explorerState = inject(ExplorerStateService);
  protected readonly auth = inject(AuthService);

  /** `?name=` and `?page=` query params, bound via withComponentInputBinding. */
  readonly name = input<string | undefined>();
  readonly page = input<string | undefined>();

  protected readonly viewMode = this.explorerState.viewMode;
  protected readonly selectedId = this.explorerState.selectedCharacterId;

  private readonly retryCount = signal(0);

  protected readonly query = computed(() => ({
    name: (this.name() ?? '').trim(),
    page: Math.max(1, Number.parseInt(this.page() ?? '1', 10) || 1),
  }));

  protected readonly state = toSignal(
    toObservable(computed(() => ({ ...this.query(), attempt: this.retryCount() }))).pipe(
      switchMap(({ name, page }) =>
        this.api.getCharacters(name, page).pipe(
          map((result): ListState => ({ status: 'ready', page: result })),
          startWith<ListState>({ status: 'loading' }),
          catchError(() => of<ListState>({ status: 'error' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as ListState },
  );

  protected readonly result = computed(() => {
    const state = this.state();
    return state.status === 'ready' ? state.page : null;
  });

  constructor() {
    // Remember the current list position so "Back" from the details page returns to it.
    effect(() => this.explorerState.listQuery.set(this.query()));
  }

  protected setViewMode(mode: ViewMode): void {
    this.explorerState.setViewMode(mode);
  }

  protected onPage(event: PageEvent): void {
    void this.router.navigate([], {
      queryParams: { page: event.pageIndex + 1 },
      queryParamsHandling: 'merge',
    });
    this.viewport.scrollToPosition([0, 0]);
  }

  protected goToFirstPage(): void {
    void this.router.navigate([], { queryParams: { page: null }, queryParamsHandling: 'merge' });
  }

  protected retry(): void {
    this.retryCount.update((count) => count + 1);
  }
}
