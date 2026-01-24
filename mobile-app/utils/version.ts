/**
 * Compares two semantic version strings.
 * 
 * @param v1 First version string (e.g., "1.2.3")
 * @param v2 Second version string (e.g., "1.2.4")
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if v1 === v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map((part) => parseInt(part, 10) || 0);
  const parts2 = v2.split('.').map((part) => parseInt(part, 10) || 0);

  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
}

/**
 * Checks if the current version is older than the minimum supported version.
 * 
 * @param currentVersion Current app version
 * @param minVersion Minimum supported version
 * @returns true if update is required
 */
export function isUpdateRequired(currentVersion: string, minVersion: string): boolean {
  return compareVersions(currentVersion, minVersion) < 0;
}
