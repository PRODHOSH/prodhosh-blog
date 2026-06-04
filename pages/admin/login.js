import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Admin.module.css";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Wrong password. Try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login | ProdhoshBlogs</title>
      </Head>
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <div className={styles.loginLogo}>
            <span className={styles.bracket}>&lt;</span>
            <span>Admin</span>
            <span className={styles.bracket}>/&gt;</span>
          </div>
          <p className={styles.loginSub}>ProdhoshBlogs dashboard</p>
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.loginInput}
              autoFocus
              required
            />
            {error && <p className={styles.loginError}>{error}</p>}
            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
