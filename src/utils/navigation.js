import { useRouter } from "next/router";

export function getCurrentPath() {
  if (typeof window === "undefined") return "/";
  return window.location.pathname + window.location.search;
}

export function buildUrlWithOrigin(targetPath, originPath) {
  const origin = originPath || getCurrentPath();

  const safeOrigin = encodeURIComponent(origin);

  // kalau target sudah punya query string
  if (targetPath.includes("?")) {
    return `${targetPath}&next=${safeOrigin}`;
  }

  return `${targetPath}?next=${safeOrigin}`;
}

/**
 * Navigasi ke target page sambil membawa origin page
 *
 * @param {object} router - next/navigation router
 * @param {string} targetPath - contoh: "/login"
 * @param {string} [originPath] - contoh: "/booking?x=1"
 */
export function navigateWithOrigin(router, targetPath, originPath) {
  const url = buildUrlWithOrigin(targetPath, originPath);
  router.push(url);
}


// =========================
export function safeNextPath(next) {
  if (!next) return "/";
  if (!next.startsWith("/")) return "/";
  return next;
}

/**
 * Ambil origin path dari query param `next`
 */
export function getOriginFromSearchParams(searchParams) {
  const next = searchParams.get("next");
  return safeNextPath(next);
}

