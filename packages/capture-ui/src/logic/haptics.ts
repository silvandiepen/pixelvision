/** A navigator that may vibrate. */
interface VibratingNavigator {
  vibrate?: (pattern: number | number[]) => boolean;
  userActivation?: { hasBeenActive: boolean };
}

/** Gentle vibration patterns, in ms. */
export const HAPTICS = {
  /** A step completed. */
  step: 12,
  /** The capture is done. */
  success: [16, 60, 24],
  /** Something went wrong. */
  error: [40, 50, 40],
} as const;

/**
 * Vibrates briefly when the device supports it (Android browsers do; iOS
 * Safari has no Vibration API). Browsers only allow it after the person
 * has interacted with the page, so it is skipped before that instead of
 * logging a console error. Never throws.
 *
 * @param pattern - Duration or on/off pattern in ms.
 * @param nav - The navigator (default the global one), injectable for tests.
 * @returns Whether a vibration was requested.
 *
 * @example
 * vibrate(HAPTICS.step);
 */
export function vibrate(
  pattern: number | readonly number[],
  nav: VibratingNavigator | undefined = globalThis.navigator as VibratingNavigator | undefined,
): boolean {
  if (!nav || typeof nav.vibrate !== "function") return false;
  if (nav.userActivation && !nav.userActivation.hasBeenActive) return false;
  try {
    return nav.vibrate(typeof pattern === "number" ? pattern : [...pattern]);
  } catch {
    // Some browsers throw when vibration is blocked (no user gesture yet); it is only a nicety.
    return false;
  }
}
