import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Role } from '../../core/models/rick-morty.models';
import { AuthService } from '../../core/services/auth.service';

interface RoleOption {
  role: Role;
  title: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-role-select',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './role-select.html',
  styleUrl: './role-select.scss',
})
export class RoleSelect {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  /** Bound from the `returnUrl` query param (see withComponentInputBinding). */
  readonly returnUrl = input<string>();

  protected readonly options: readonly RoleOption[] = [
    {
      role: 'admin',
      title: 'Admin',
      icon: 'admin_panel_settings',
      description: 'Full access: browse all characters and open character details with episodes.',
    },
    {
      role: 'viewer',
      title: 'Viewer',
      icon: 'visibility',
      description: 'Read-only access: can browse and search the character list only.',
    },
  ];

  protected choose(role: Role): void {
    this.auth.setRole(role);
    void this.router.navigateByUrl(this.safeReturnUrl());
  }

  /** Only internal absolute paths are allowed as a return target. */
  private safeReturnUrl(): string {
    const url = this.returnUrl();
    const isInternal = !!url && url.startsWith('/') && !url.startsWith('//');
    return isInternal && !url.startsWith('/role-select') ? url : '/characters';
  }
}
