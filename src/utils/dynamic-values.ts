// src/utils/dynamic-values.ts

/**
 * RNG token format:
 *   "RNG15" -> random numeric string of length 15
 *   "RNG4"  -> random numeric string of length 4
 */
const RNG_TOKEN_REGEX = /^RNG(\d+)$/;

export function resolveDynamicString(
  value: string | null | undefined
): string | undefined {
  if (value == null) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const match = RNG_TOKEN_REGEX.exec(trimmed);
  if (!match) {
    return trimmed;
  }

  const length = Number(match[1]);
  if (!Number.isFinite(length) || length <= 0 || length > 64) {
    // Defensive: don't allow crazy lengths
    throw new Error(
      `Invalid RNG token "${value}" – length must be between 1 and 64`
    );
  }

  return randomNumericString(length);
}

/** Generate a random numeric string of given length (e.g. "42837291"). */
export function randomNumericString(length: number): string {
  let result = "";
  const digits = "0123456789";

  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * 10);
    result += digits[idx];
  }

  return result;
}
