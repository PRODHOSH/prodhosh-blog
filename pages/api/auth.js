import { serialize } from "cookie";

export default function handler(req, res) {
  if (req.method === "POST") {
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Wrong password" });
    }

    res.setHeader(
      "Set-Cookie",
      serialize("admin_token", process.env.ADMIN_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
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
