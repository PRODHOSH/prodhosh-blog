// Browser-side helpers for the admin UI.

export async function api(url, { method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  if (res.status === 401 && !url.startsWith("/api/auth")) {
    window.location.href = "/admin/login";
    throw new Error("Session expired — please sign in again.");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function readAsBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = () => reject(new Error("Could not read the file."));
    r.readAsDataURL(blob);
  });
}

function hasAlpha(ctx, w, h) {
  const { data } = ctx.getImageData(0, 0, w, h);
  for (let i = 3; i < data.length; i += 16) if (data[i] < 250) return true;
  return false;
}

// Resize + compress in the browser so uploads stay small and fast.
// GIFs are passed through untouched (to keep animation).
export async function prepareImage(file, { maxDim = 1800, quality = 0.86 } = {}) {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
    throw new Error("Only JPG, PNG, WebP and GIF images are supported.");
  }
  const base = (file.name || "image").replace(/\.[^.]+$/, "");

  if (file.type === "image/gif") {
    const bmp = await createImageBitmap(file);
    return { filename: `${base}.gif`, mime: "image/gif", data: await readAsBase64(file), width: bmp.width, height: bmp.height, size: file.size };
  }

  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0, w, h);

  const keepPng = file.type === "image/png" && hasAlpha(ctx, w, h);
  let mime = keepPng ? "image/png" : "image/jpeg";
  if (!keepPng) {
    // JPEG has no alpha: paint a white backdrop first.
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
  }
  const blob = await new Promise((res) => canvas.toBlob(res, mime, quality));
  if (!blob) throw new Error("Could not process that image.");
  return {
    filename: `${base}.${keepPng ? "png" : "jpg"}`,
    mime,
    data: await readAsBase64(blob),
    width: w,
    height: h,
    size: blob.size,
  };
}

export async function uploadImage(file, alt = "") {
  const img = await prepareImage(file);
  return api("/api/media", { method: "POST", body: { ...img, alt } });
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
