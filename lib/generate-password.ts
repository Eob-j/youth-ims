import "server-only";

import crypto from "crypto";

// Letters and digits without look-alikes (0/O, 1/l/I), plus a few symbols, so
// a password copied by hand is less likely to be mistyped.
export const PASSWORD_SETS = [
  "abcdefghijkmnopqrstuvwxyz",
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "23456789",
  "!@#$%*?",
];

// A random password with at least one character from each set. The default
// length is within the 8-20 characters allowed by lib/auth.ts.
export function generatePassword(length = 16) {
  const all = PASSWORD_SETS.join("");
  const chars = PASSWORD_SETS.map((set) => set[crypto.randomInt(set.length)]);
  while (chars.length < length) {
    chars.push(all[crypto.randomInt(all.length)]);
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
