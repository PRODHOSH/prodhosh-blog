// Signed, expiring admin sessions. Uses Web Crypto so it runs in both the
// Node API routes and the Edge middleware.
export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL = 60 * 60 * 24 * 7; // seconds

const enc = new TextEncoder();

function b64url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(message) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET is not set");
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`session:${message}`));
  return b64url(new Uint8Array(sig));
}

export function safeEqual(a = "", b = "") {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(12)));
  const payload = `${exp}.${nonce}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token) {
  if (!token || !process.env.ADMIN_SECRET) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, await sign(`${exp}.${nonce}`));
}

export async function isAdmin(req) {
  return verifySessionToken(req.cookies?.[SESSION_COOKIE]);
}

// Guard for API routes. Returns true when the request may proceed; otherwise it
// has already sent the response. Mutating requests must also be same-origin (CSRF).
export async function requireAdmin(req, res) {
  if (!(await isAdmin(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.headers.origin;
    if (origin) {
      let host = "";
      try {
        host = new URL(origin).host;
      } catch {}
      if (host !== req.headers.host) {
        res.status(403).json({ error: "Cross-origin request blocked" });
        return false;
      }
    }
  }
  return true;
}
