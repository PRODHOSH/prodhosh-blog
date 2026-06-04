import { serialize } from "cookie";
import otplib from "otplib";
const { authenticator } = otplib;

async function verifyTurnstile(token, ip) {
  // Skip if Turnstile is not configured (local dev)
  if (!process.env.TURNSTILE_SECRET_KEY) return true;

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
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { password, totpCode, turnstileToken } = req.body;
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    // 1. Turnstile human verification
    const humanOk = await verifyTurnstile(turnstileToken, ip);
    if (!humanOk) {
      return res
        .status(400)
        .json({ error: "Human verification failed. Please try again." });
    }

    // 2. Password check
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Wrong password." });
    }

    // 3. TOTP check (skip if not configured — dev only)
    if (process.env.TOTP_SECRET) {
      const totpOk = authenticator.verify({
        token: String(totpCode).trim(),
        secret: process.env.TOTP_SECRET,
      });
      if (!totpOk) {
        return res
          .status(401)
          .json({ error: "Invalid authenticator code. Check your app and try again." });
      }
    }

    // All checks passed — set session cookie
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
