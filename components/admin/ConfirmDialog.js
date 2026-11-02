import { useEffect } from "react";
import styles from "../../styles/Admin.module.css";

export default function ConfirmDialog({ title, body, confirmLabel = "Delete", busy, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className={styles.modalScrim} onClick={onCancel}>
      <div className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" onClick={(e) => e.stopPropagation()}>
        <h2 id="dlg-t" className={styles.dialogTitle}>
          {title}
        </h2>
        <p className={styles.dialogBody}>{body}</p>
        <div className={styles.dialogActions}>
          <button className={styles.btn} onClick={onCancel} autoFocus>
            Cancel
          </button>
          <button className={styles.btnDanger} onClick={onConfirm} disabled={busy}>
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
