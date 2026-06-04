import Head from "next/head";
import Script from "next/script";
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Admin.module.css";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Get Turnstile token if widget is present
    const turnstileToken =
      document.querySelector('[name="cf-turnstile-response"]')?.value || null;

    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the human verification first.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, totpCode, turnstileToken }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error || "Login failed.");
      setLoading(false);
      // Reset Turnstile widget so user can try again
      if (typeof window !== "undefined" && window.turnstile) {
        window.turnstile.reset();
      }
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login | ProdhoshBlogs</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
      )}

      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <div className={styles.loginLogo}>
            <span className={styles.bracket}>&lt;</span>
            <span>Admin</span>
            <span className={styles.bracket}>/&gt;</span>
          </div>
          <p className={styles.loginSub}>ProdhoshBlogs dashboard</p>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <label className={styles.loginLabel}>Password</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.loginInput}
              autoFocus
              required
            />

            <label className={styles.loginLabel}>
              Authenticator Code
              <span className={styles.loginLabelHint}> — Google Authenticator</span>
            </label>
            <input
              type="text"
              placeholder="6-digit code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`${styles.loginInput} ${styles.loginInputMono}`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />

            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <div
                className="cf-turnstile"
                data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                data-theme="light"
                style={{ margin: "4px 0" }}
              />
            )}

            {error && <p className={styles.loginError}>{error}</p>}

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={loading}
            >
              {loading ? "Verifying…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
