import { Episode } from '../../../core/models/rick-morty.models';
import { filterEpisodesByName } from './episode-filter';

const make = (id: number, name: string, air_date: string, code: string): Episode => ({
  id,
  name,
  air_date,
  episode: code,
  characters: [],
  url: '',
  created: '',
});

const episodes: Episode[] = [
  make(1, 'Pilot', 'December 2, 2013', 'S01E01'),
  make(2, 'Lawnmower Dog', 'December 9, 2013', 'S01E02'),
  make(3, 'Rick Potion #9', 'January 27, 2014', 'S01E06'),
];

describe('filterEpisodesByName', () => {
  it('returns every episode for an empty or blank term', () => {
    expect(filterEpisodesByName(episodes, '')).toEqual(episodes);
    expect(filterEpisodesByName(episodes, '   ')).toEqual(episodes);
  });

  it('matches case-insensitively on a substring of the name', () => {
    expect(filterEpisodesByName(episodes, 'PILOT').map((e) => e.id)).toEqual([1]);
    expect(filterEpisodesByName(episodes, 'o').map((e) => e.id)).toEqual([1, 2, 3]);
    expect(filterEpisodesByName(episodes, 'potion').map((e) => e.id)).toEqual([3]);
  });

  it('searches the name only, not air_date or episode code', () => {
    expect(filterEpisodesByName(episodes, 'December')).toEqual([]);
    expect(filterEpisodesByName(episodes, 'S01E02')).toEqual([]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterEpisodesByName(episodes, 'zzz')).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const copy = [...episodes];
    filterEpisodesByName(episodes, '');
    expect(episodes).toEqual(copy);
  });
});
