export const AUTH_RETURN_KEY = "RETURN_AFTER_LOGIN";

export function setReturnAfterLogin(path: string) {
  if (!path || !path.startsWith("/")) return;
  sessionStorage.setItem(AUTH_RETURN_KEY, path);
}

export function consumeReturnAfterLogin() {
  const v = sessionStorage.getItem(AUTH_RETURN_KEY) || "";
  sessionStorage.removeItem(AUTH_RETURN_KEY);
  if (!v || !v.startsWith("/")) return "";
  return v;
}
