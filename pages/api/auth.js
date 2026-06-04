import { serialize } from "cookie";
import { createHmac } from "crypto";

// ── TOTP (RFC 6238) using Node crypto — no external dependency ──

function base32Decode(encoded) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const str = encoded.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0, value = 0;
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

function verifyTotp(token, secret, windowSteps = 1) {
  const counter = Math.floor(Date.now() / 1000 / 30);
  const key = base32Decode(secret);
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
    if (String(code).padStart(6, "0") === String(token).trim()) return true;
  }
  return false;
}

// ── Cloudflare Turnstile ──

async function verifyTurnstile(token, ip) {
  if (!process.env.TURNSTILE_SECRET_KEY) return true;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: ip,
        }),
      }
    );
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

// ── Handler ──

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { password, totpCode, turnstileToken } = req.body;
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "";

    const humanOk = await verifyTurnstile(turnstileToken, ip);
    if (!humanOk) {
      return res.status(400).json({ error: "Human verification failed. Please try again." });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Wrong password." });
    }

    if (process.env.TOTP_SECRET) {
      const totpOk = verifyTotp(totpCode, process.env.TOTP_SECRET);
      if (!totpOk) {
        return res.status(401).json({ error: "Invalid authenticator code. Check your app and try again." });
      }
    }

    res.setHeader(
      "Set-Cookie",
      serialize("admin_token", process.env.ADMIN_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    );
    return res.json({ ok: true });
  }

  if (req.method === "DELETE") {
    res.setHeader(
      "Set-Cookie",
      serialize("admin_token", "", { maxAge: 0, path: "/" })
    );
    return res.json({ ok: true });
  }

  res.status(405).end();
}
