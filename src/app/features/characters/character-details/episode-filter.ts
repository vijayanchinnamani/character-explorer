import { Episode } from '../../../core/models/rick-morty.models';

/**
 * Client-side, case-insensitive "contains" filter on the episode name only
 * (not on air_date or episode code). An empty term returns everything.
 */
export function filterEpisodesByName(episodes: readonly Episode[], term: string): Episode[] {
  const needle = term.trim().toLowerCase();
  if (!needle) {
    return [...episodes];
  }
  return episodes.filter((episode) => episode.name.toLowerCase().includes(needle));
}
