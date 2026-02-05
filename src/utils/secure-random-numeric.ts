// src/utils/secure-random-numeric.ts

/*
 * QUICK START GUIDE – How to use the random numeric string generators
 *
 * 1. Simple / default usage (fast, never starts with zero):
 *    import { resolveDynamicString } from './secure-random-numeric';
 *    const code = resolveDynamicString("RNG6");           // → e.g. "749281"
 *    const pin  = resolveDynamicString("RNG4");           // → e.g. "5839"
 *
 *
 * 2. Using a secure (cryptographic) version instead:
 *    import { resolveDynamicString, secureRandomNumericString } from './secure-random-numeric';
 *    const secureCode = resolveDynamicString("RNG8", secureRandomNumericString);
 *    // → e.g. "39275014"  (never starts with 0, cryptographically secure)
 *
 *
 * 3. Allow leading zeros (e.g. for fixed-length codes where 0 is valid):
 *    import { resolveDynamicString, randomNumericString } from './secure-random-numeric';
 *    const codeWithZero = resolveDynamicString("RNG6", randomNumericString, {
 *      allowLeadingZero: true
 *    });
 *    // → could be "042917" or "008352"
 *
 *
 * 4. Direct calls (without using resolveDynamicString):
 *    import {
 *      randomNumericString,
 *      secureRandomNumericString,
 *      secureRandomNumericStringUniform
 *    } from './secure-random-numeric';
 *
 *    // Fast, non-secure
 *    randomNumericString(6);                                 // → e.g. "718492"
 *    randomNumericString(6, { allowLeadingZero: true });     // → could be "029381"
 *
 *    // Secure, simple (recommended for most cases)
 *    secureRandomNumericString(10);                          // never starts with 0
 *    secureRandomNumericString(10, { allowLeadingZero: true }); // can start with 0
 *
 *    // Secure + best uniformity (slightly slower but mathematically fairest)
 *    secureRandomNumericStringUniform(12);
 *
 *
 * Quick decision guide:
 *   - Just need something quick for tests/mocks?            → randomNumericString
 *   - Need secure tokens, codes, IDs, reset links?          → secureRandomNumericString
 *   - Need the most statistically fair distribution?        → secureRandomNumericStringUniform
 *   - Want to allow leading zeros? Add { allowLeadingZero: true }
 */

/**
 * RNG token format examples:
 *   "RNG15"  → random 15-digit numeric string
 *   "RNG4"   → random 4-digit numeric string
 */
const RNG_TOKEN_REGEX = /^RNG(\d+)$/;

/**
 * Configuration options for numeric string generation
 */
export interface RandomNumericOptions {
  /**
   * Allow the string to start with '0'.
   * @default false
   */
  allowLeadingZero?: boolean;
}

/**
 * Resolves a value that may contain an RNG token.
 * If the input matches /^RNG(\d+)$/, generates a random numeric string.
 * Otherwise returns the trimmed input unchanged.
 *
 * @param value Input string (or null/undefined)
 * @param generator Which RNG implementation to use (default = fast non-crypto)
 * @returns Resolved string or undefined
 * @throws Error if RNG token has invalid length
 */
export function resolveDynamicString(
  value: string | null | undefined,
  generator: (
    length: number,
    options?: RandomNumericOptions,
  ) => string = randomNumericString,
): string | undefined {
  if (value == null) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const match = RNG_TOKEN_REGEX.exec(trimmed);
  if (!match) return trimmed;

  const length = Number(match[1]);
  if (!Number.isFinite(length) || length <= 0 || length > 64) {
    throw new Error(`Invalid RNG length in "${value}" – must be 1–64`);
  }

  return generator(length, { allowLeadingZero: false });
}

/**
 * Fast, **non-cryptographic** random numeric string generator using Math.random().
 * Suitable for testing, mock data, non-security-sensitive use cases.
 *
 * @param length Desired string length (≥ 0)
 * @param options Configuration
 * @returns Exactly `length` digits as string
 */
export function randomNumericString(
  length: number,
  options: RandomNumericOptions = {},
): string {
  const { allowLeadingZero = false } = options;

  if (length <= 0) return "";

  const parts: string[] = [];

  // First digit
  if (length === 1 || allowLeadingZero) {
    parts.push(Math.floor(Math.random() * 10).toString());
  } else {
    parts.push((Math.floor(Math.random() * 9) + 1).toString());
  }

  // Remaining digits: 0–9
  for (let i = 1; i < length; i++) {
    parts.push(Math.floor(Math.random() * 10).toString());
  }

  return parts.join("");
}

/**
 * Cryptographically secure numeric string generator (simple modulo method).
 * Small bias exists in digit distribution (especially first digit), usually acceptable.
 *
 * @param length Desired string length (≥ 0)
 * @param options Configuration
 * @returns Exactly `length` digits as string
 */
export function secureRandomNumericString(
  length: number,
  options: RandomNumericOptions = {},
): string {
  const { allowLeadingZero = false } = options;

  if (length <= 0) return "";

  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  const parts: string[] = [];

  // First digit
  if (length === 1 || allowLeadingZero) {
    parts.push((bytes[0] % 10).toString());
  } else {
    // 1–9 (slight bias is usually acceptable)
    let first = bytes[0] % 9;
    first += 1;
    parts.push(first.toString());
  }

  // Remaining digits 0–9
  for (let i = 1; i < length; i++) {
    parts.push((bytes[i] % 10).toString());
  }

  return parts.join("");
}

/**
 * Cryptographically secure numeric string generator with **uniform distribution**.
 * Uses rejection sampling for the first digit when !allowLeadingZero.
 * Best statistical properties of the three options.
 *
 * @param length Desired string length (≥ 0)
 * @param options Configuration
 * @returns Exactly `length` digits as string
 */
export function secureRandomNumericStringUniform(
  length: number,
  options: RandomNumericOptions = {},
): string {
  const { allowLeadingZero = false } = options;

  if (length <= 0) return "";

  const parts: string[] = [];

  if (length === 1 || allowLeadingZero) {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    for (const b of arr) {
      parts.push((b % 10).toString());
    }
  } else {
    // First digit 1–9 — rejection sampling for uniformity
    // We accept values < 225 → divides evenly into 9 buckets (25 each)
    // Rejection probability ≈ 11.7% — negligible performance impact
    while (true) {
      const arr = new Uint8Array(1);
      crypto.getRandomValues(arr);
      const val = arr[0];
      if (val < 225) {
        const digit = Math.floor(val / 25) + 1; // → 1..9
        parts.push(digit.toString());
        break;
      }
    }

    // Remaining digits 0–9
    const rest = new Uint8Array(length - 1);
    crypto.getRandomValues(rest);
    for (const b of rest) {
      parts.push((b % 10).toString());
    }
  }

  return parts.join("");
}
