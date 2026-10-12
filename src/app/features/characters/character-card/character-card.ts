import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Character, ViewMode } from '../../../core/models/rick-morty.models';

/** Presentational card used by both the grid and the list layout. */
@Component({
  selector: 'app-character-card',
  imports: [NgTemplateOutlet, RouterLink, MatIconModule, MatTooltipModule],
  templateUrl: './character-card.html',
  styleUrl: './character-card.scss',
  host: { '[class.list]': "layout() === 'list'" },
})
export class CharacterCard {
  readonly character = input.required<Character>();
  readonly layout = input<ViewMode>('grid');
  /** When false (Viewer role) the card is shown but cannot open the details page. */
  readonly clickable = input(true);
  readonly selected = input(false);
}
