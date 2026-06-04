/**
 * Run once to generate your TOTP secret:
 *   node scripts/setup-totp.mjs
 *
 * Then add TOTP_SECRET to .env.local and scan the key in Google Authenticator.
 */
import { randomBytes } from "crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function toBase32(buf) {
  let result = "";
  let bits = 0;
  let value = 0;
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      result += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) result += BASE32[(value << (5 - bits)) & 31];
  return result;
}

const secret = toBase32(randomBytes(20));
const issuer = "ProdhoshBlogs";
const account = "admin@prodhosh.me";
const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

console.log("\n============================================");
console.log("  ProdhoshBlogs — TOTP 2FA Setup");
console.log("============================================\n");

console.log("Step 1 — Add this to your .env.local:\n");
console.log(`  TOTP_SECRET=${secret}\n`);

console.log("Step 2 — Open Google Authenticator on your phone:");
console.log("  Tap +  →  Enter a setup key");
console.log(`  Account name : ${account}`);
console.log(`  Key          : ${secret}`);
console.log("  Type         : Time based\n");

console.log("Step 3 — Or paste this into a QR code generator and scan it:");
console.log(`  ${otpauth}\n`);

console.log("Once scanned, Authenticator will show a 6-digit code.");
console.log("That is your second login factor from now on.\n");
console.log("============================================\n");
