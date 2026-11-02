import { serialize } from "cookie";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { SESSION_COOKIE, SESSION_TTL, createSessionToken } from "../../lib/auth";

// ── TOTP (RFC 6238) using Node crypto — no external dependency ──

function base32Decode(encoded) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const str = encoded.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0,
    value = 0;
  const output = [];
  for (const char of str) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

let lastTotpStep = 0; // best-effort replay guard (per server instance)

// Returns the matching time-step, or 0 when the code is wrong / already used.
function verifyTotp(token, secret, windowSteps = 1) {
  const counter = Math.floor(Date.now() / 1000 / 30);
  const key = base32Decode(secret);
  const given = String(token || "").trim();
  let matched = 0;
  for (let i = -windowSteps; i <= windowSteps; i++) {
    const count = counter + i;
    const buf = Buffer.alloc(8);
    buf.writeUInt32BE(Math.floor(count / 0x100000000), 0);
    buf.writeUInt32BE(count >>> 0, 4);
    const hmac = createHmac("sha1", key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      (((hmac[offset] & 0x7f) << 24) |
        (hmac[offset + 1] << 16) |
        (hmac[offset + 2] << 8) |
        hmac[offset + 3]) %
      1000000;
    if (eq(String(code).padStart(6, "0"), given)) matched = count;
  }
  if (matched && matched <= lastTotpStep) return 0;
  return matched;
}

// Constant-time string compare (hash first so lengths always match).
function eq(a, b) {
  const ha = createHash("sha256").update(String(a)).digest();
  const hb = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

// ── Cloudflare Turnstile ──

async function verifyTurnstile(token, ip) {
  if (!process.env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

// ── Brute-force throttle: 5 failures / 15 min per IP (per server instance) ──

const attempts = new Map();
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function throttleState(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) return { count: 0, resetAt: now + WINDOW_MS };
  return rec;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Handler ──

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { password, totpCode, turnstileToken } = req.body || {};
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket?.remoteAddress || "unknown";

    const state = throttleState(ip);
    if (state.count >= MAX_FAILS) {
      const mins = Math.ceil((state.resetAt - Date.now()) / 60000);
      return res.status(429).json({ error: `Too many attempts. Try again in ${mins} min.` });
    }

    if (!(await verifyTurnstile(turnstileToken, ip))) {
      return res.status(400).json({ error: "Human verification failed. Please try again." });
    }

    // Check both factors before answering so the response never reveals which one failed.
    const passwordOk = !!process.env.ADMIN_PASSWORD && eq(password || "", process.env.ADMIN_PASSWORD);
    let totpStep = 1;
    if (process.env.TOTP_SECRET) totpStep = verifyTotp(totpCode, process.env.TOTP_SECRET);

    if (!passwordOk || !totpStep) {
      attempts.set(ip, { count: state.count + 1, resetAt: state.resetAt });
      await sleep(500);
      return res.status(401).json({ error: "Invalid credentials or authenticator code." });
    }

    attempts.delete(ip);
    if (process.env.TOTP_SECRET) lastTotpStep = totpStep;

    res.setHeader(
      "Set-Cookie",
      serialize(SESSION_COOKIE, await createSessionToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_TTL,
      })
    );
    return res.json({ ok: true });
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", serialize(SESSION_COOKIE, "", { maxAge: 0, path: "/" }));
    return res.json({ ok: true });
  }

  res.status(405).end();
}
