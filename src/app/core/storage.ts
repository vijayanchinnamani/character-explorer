/**
 * sessionStorage can throw (private mode, blocked storage), so every access is guarded
 * and the app keeps working with in-memory state only.
 */
export function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: string | null): void {
  try {
    if (value === null) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
    }
  } catch {
    // Ignore: persistence is a convenience, not a requirement.
  }
}
