const PLACEHOLDER = "/placeholder.webp";

const isBrowser = typeof window !== "undefined";

function safeUrl(src) {
  if (!src || typeof src !== "string") return null;
  try {
    return new URL(src, isBrowser ? window.location.origin : "http://localhost");
  } catch {
    return null;
  }
}

export function getOriginalImageUrl(producto) {
  return producto?.imagenes?.length > 0 ? producto.imagenes[0].urlImagen : PLACEHOLDER;
}

export function getOptimizedImageUrl(src, width = 400, height = 300, quality = 70) {
  const url = safeUrl(src);
  if (!url) return PLACEHOLDER;

  const raw = String(src);
  const isLocal = !/^https?:\/\//i.test(raw) || (isBrowser && url.origin === window.location.origin);
  if (isLocal) return raw;

  const host = url.hostname.toLowerCase();

  if (host.includes("res.cloudinary.com") && url.pathname.includes("/image/upload/")) {
    const transform = `f_auto,q_auto:eco,c_fill,w_${width},h_${height}`;
    url.pathname = url.pathname.replace("/image/upload/", `/image/upload/${transform}/`);
    return url.toString();
  }

  if (host.includes("images.unsplash.com")) {
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("h", String(height));
    url.searchParams.set("q", String(quality));
    return url.toString();
  }

  if (host.includes("images.pexels.com")) {
    url.searchParams.set("auto", "compress");
    url.searchParams.set("cs", "tinysrgb");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("h", String(height));
    return url.toString();
  }

  if (host.includes("ik.imagekit.io")) {
    url.searchParams.set("tr", `w-${width},h-${height},fo-auto,q-${quality},f-webp`);
    return url.toString();
  }

  // Para URLs externas sin transformación propia, se usa un proxy de redimensionado.
  // Esto evita descargar imágenes enormes en el catálogo de Lighthouse.
  const withoutProtocol = raw.replace(/^https?:\/\//i, "");
  return `https://images.weserv.nl/?url=${encodeURIComponent(withoutProtocol)}&w=${width}&h=${height}&fit=cover&output=webp&q=${quality}`;
}

export function getImageSrcSet(src, sizes = [240, 400, 600]) {
  return sizes
    .map((width) => `${getOptimizedImageUrl(src, width, Math.round(width * 0.75))} ${width}w`)
    .join(", ");
}

export const productCardImageSizes = "(min-width: 1280px) 18vw, (min-width: 768px) 30vw, (min-width: 640px) 45vw, 92vw";
export const suggestionImageSizes = "60px";
export const placeholderImage = PLACEHOLDER;
