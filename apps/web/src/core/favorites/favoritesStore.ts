const KEY = 'speakoo_favorites';

export function getFavoriteIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function isFavorite(tutorId: string): boolean {
  return getFavoriteIds().includes(tutorId);
}

/** Toggles favourite state. Returns `true` if the tutor is now a favourite. */
export function toggleFavorite(tutorId: string): boolean {
  const ids = getFavoriteIds();
  const idx = ids.indexOf(tutorId);
  if (idx >= 0) {
    ids.splice(idx, 1);
  } else {
    ids.push(tutorId);
  }
  localStorage.setItem(KEY, JSON.stringify(ids));
  return idx < 0;
}
