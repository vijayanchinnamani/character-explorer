import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AccessDenied } from './features/access-denied/access-denied';
import { CharacterDetails } from './features/characters/character-details/character-details';
import { CharacterList } from './features/characters/character-list/character-list';
import { RoleSelect } from './features/role-select/role-select';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'characters' },
  { path: 'role-select', component: RoleSelect, title: 'Choose a role' },
  {
    path: 'characters',
    component: CharacterList,
    canActivate: [authGuard],
    title: 'Characters',
  },
  {
    // Details are Admin-only; Viewers are redirected to /access-denied by roleGuard.
    path: 'characters/:id',
    component: CharacterDetails,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    title: 'Character details',
  },
  {
    path: 'access-denied',
    component: AccessDenied,
    canActivate: [authGuard],
    title: 'Access denied',
  },
  { path: '**', redirectTo: 'characters' },
];
