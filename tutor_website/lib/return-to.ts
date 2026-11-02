// Remembers the page a student was on (e.g. a tutor) when they went to sign
// up, so we can bring them back after they confirm their email. Only works
// when they confirm in the same browser; otherwise they land on the home page.
const KEY = "passalong-return-to";

// Only paths on this site ("/..." but not "//...").
export function isSafePath(path: string | null): path is string {
  return !!path && /^\/(?!\/)/.test(path);
}

export function saveReturnTo(path: string | null) {
  if (!isSafePath(path)) return;
  try {
    localStorage.setItem(KEY, path);
  } catch {
    // Storage blocked (private mode): they'll just land on the home page.
  }
}

export function takeReturnTo(): string | null {
  try {
    const path = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    return isSafePath(path) ? path : null;
  } catch {
    return null;
  }
}
