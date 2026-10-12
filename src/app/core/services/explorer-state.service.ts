import { Injectable, signal } from '@angular/core';
import { ViewMode } from '../models/rick-morty.models';
import { readSession, writeSession } from '../storage';

export const VIEW_MODE_STORAGE_KEY = 'character-explorer.view-mode';

export interface ListQuery {
  name: string;
  page: number;
}

/**
 * UI state that must survive navigation between the list and the details page.
 * Page and search term live in the URL (query params) so back/forward and refresh work;
 * this service holds what the URL cannot: list/grid mode, last list query and the
 * last opened character.
 */
@Injectable({ providedIn: 'root' })
export class ExplorerStateService {
  private readonly _viewMode = signal<ViewMode>(this.restoreViewMode());

  readonly viewMode = this._viewMode.asReadonly();
  readonly selectedCharacterId = signal<number | null>(null);
  readonly listQuery = signal<ListQuery>({ name: '', page: 1 });

  setViewMode(mode: ViewMode): void {
    this._viewMode.set(mode);
    writeSession(VIEW_MODE_STORAGE_KEY, mode);
  }

  private restoreViewMode(): ViewMode {
    return readSession(VIEW_MODE_STORAGE_KEY) === 'list' ? 'list' : 'grid';
  }
}
