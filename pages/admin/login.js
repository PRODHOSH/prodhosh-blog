import Head from "next/head";
import Script from "next/script";
import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../lib/client";
import styles from "../../styles/Admin.module.css";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value || null;
    if (SITE_KEY && !turnstileToken) {
      setError("Please complete the human verification first.");
      setLoading(false);
      return;
    }

    try {
      await api("/api/auth", { method: "POST", body: { password, totpCode, turnstileToken } });
      const next = typeof router.query.next === "string" && router.query.next.startsWith("/admin") ? router.query.next : "/admin";
      router.push(next);
    } catch (err) {
      setError(err.message || "Login failed.");
      setLoading(false);
      window.turnstile?.reset();
    }
  }

  return (
    <>
      <Head>
        <title>Admin sign in</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {SITE_KEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />}

      <div className={styles.loginPage}>
        <form onSubmit={handleSubmit} className={styles.loginCard}>
          <div className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" width="34" height="34" /> <span>prodhosh<span className={styles.slash}>/admin</span></span>
          </div>
          <h1 className={styles.loginTitle}>Sign in</h1>
          <p className={styles.muted}>Password and authenticator code required.</p>

          <label className={styles.field}>
            <span>Password</span>
            <div className={styles.pwWrap}>
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                autoComplete="current-password"
                autoFocus
                required
              />
              <button type="button" className={styles.pwToggle} onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label className={styles.field}>
            <span>Authenticator code</span>
            <input
              type="text"
              placeholder="123456"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`${styles.input} ${styles.mono}`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />
          </label>

          {SITE_KEY && <div className="cf-turnstile" data-sitekey={SITE_KEY} data-theme="light" />}

          {error && (
            <p className={styles.formError} role="alert">
              {error}
            </p>
          )}

          <button type="submit" className={styles.btnPrimaryLg} disabled={loading}>
            {loading ? "Verifying…" : "Sign in"}
          </button>
        </form>
      </div>
    </>
  );
}
