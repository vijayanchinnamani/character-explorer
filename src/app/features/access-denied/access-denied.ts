import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-access-denied',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss',
})
export class AccessDenied {
  protected readonly auth = inject(AuthService);

  /** Bound from the `from` query param: the route the user tried to open. */
  readonly from = input<string>();
}
