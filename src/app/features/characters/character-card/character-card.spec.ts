import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { makeCharacter } from '../../../testing/fixtures';
import { CharacterCard } from './character-card';

describe('CharacterCard', () => {
  function render(inputs: { clickable?: boolean; selected?: boolean; layout?: 'grid' | 'list' } = {}) {
    TestBed.configureTestingModule({ imports: [CharacterCard], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(CharacterCard);
    fixture.componentRef.setInput(
      'character',
      makeCharacter(7, { name: 'Birdperson', status: 'Dead', species: 'Alien', gender: 'Male', episode: ['a', 'b', 'c'] }),
    );
    Object.entries(inputs).forEach(([key, value]) => fixture.componentRef.setInput(key, value));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows name, status, species, gender and the total number of episodes', () => {
    const root = render();
    const facts = Array.from(root.querySelectorAll('.facts > div')).map((row) => ({
      label: row.querySelector('dt')?.textContent?.trim(),
      value: row.querySelector('dd')?.textContent?.trim(),
    }));

    expect(root.querySelector('.name')?.textContent?.trim()).toBe('Birdperson');
    expect(root.querySelector('.status')?.textContent?.trim()).toBe('Dead');
    expect(facts).toEqual([
      { label: 'Species', value: 'Alien' },
      { label: 'Gender', value: 'Male' },
      { label: 'Episodes', value: '3' },
    ]);
  });

  it('shows the avatar with a descriptive alt text', () => {
    const img = render().querySelector('img.avatar') as HTMLImageElement;

    expect(img.getAttribute('alt')).toBe('Avatar of Birdperson');
  });

  it('is a link to the details route when clickable', () => {
    const link = render({ clickable: true }).querySelector('a.card');

    expect(link?.getAttribute('href')).toBe('/characters/7');
  });

  it('is not a link and shows a lock when not clickable (Viewer)', () => {
    const root = render({ clickable: false });

    expect(root.querySelector('a')).toBeNull();
    expect(root.querySelector('.card.disabled')).not.toBeNull();
    expect(root.querySelector('.lock')).not.toBeNull();
  });

  it('marks the selected card', () => {
    expect(render({ selected: true }).querySelector('a.card.selected')).not.toBeNull();
  });
});
