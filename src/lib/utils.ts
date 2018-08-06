/* Copyright (c) 2018 Marco Stahl */

// Seems pointless, but makes things more type-safe.
export function first<T>(array: ReadonlyArray<T>): T | undefined {
  return array[0];
}

// Seems pointless, but makes things more type-safe.
export function last<T>(array: ReadonlyArray<T>): T | undefined {
  return array[array.length - 1];
}

export function mapOptional<T, R>(x: T | undefined, f: (y: T) => R): R | undefined {
  if (x === undefined) {
    return undefined;
  }

  return f(x);
}

export function getYearFromTimestamp(timestamp: number | string): number {
  return new Date(timestamp).getFullYear();
}
