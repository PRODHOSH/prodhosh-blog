import { useRouter } from "next/router";
import Header from "./Header";
import Footer from "./Footer";
import { ToastProvider } from "./admin/Toast";
import styles from "./Layout.module.css";

export default function Layout({ children }) {
  const { pathname } = useRouter();

  // Admin screens bring their own chrome.
  if (pathname.startsWith("/admin")) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <div className={styles.layout}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main" className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
