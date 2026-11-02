import { createContext, useCallback, useContext, useRef, useState } from "react";
import styles from "../../styles/Admin.module.css";

const ToastCtx = createContext(() => {});

export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const push = useCallback((message, kind = "ok") => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className={styles.toasts} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${t.kind === "error" ? styles.toastError : ""}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
