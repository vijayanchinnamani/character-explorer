import { Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { debounceTime, filter, map } from 'rxjs';
import { AuthService } from './core/services/auth.service';

const LIST_PATH = '/characters';

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  /** Global search box. The search term lives in the URL (?name=) so it survives navigation. */
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    // URL -> search box (browser back/forward, page refresh, deep links).
    effect(() => {
      const tree = this.router.parseUrl(this.currentUrl());
      const path = this.currentUrl().split('?')[0];
      if (path === LIST_PATH) {
        const name = tree.queryParams['name'];
        this.searchControl.setValue(typeof name === 'string' ? name : '', { emitEvent: false });
      } else if (path === '/role-select') {
        this.searchControl.setValue('', { emitEvent: false });
      }
    });

    // Search box -> URL (debounced; page resets to 1 because `page` is dropped).
    this.searchControl.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe((value) => this.applySearch(value));
  }

  protected clearSearch(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.applySearch('');
  }

  protected switchRole(): void {
    this.auth.clearRole();
    void this.router.navigateByUrl('/role-select');
  }

  private applySearch(value: string): void {
    // A debounced keystroke can fire right after "Switch role"; the guard would just bounce it.
    if (!this.auth.isAuthenticated()) {
      return;
    }

    const term = value.trim();
    const onList = this.router.url.split('?')[0] === LIST_PATH;
    const currentName = this.router.parseUrl(this.router.url).queryParams['name'] ?? '';
    if (onList && term === currentName) {
      return;
    }
    void this.router.navigate([LIST_PATH], { queryParams: { name: term || null } });
  }
}
