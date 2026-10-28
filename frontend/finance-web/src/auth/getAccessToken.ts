import { User } from "oidc-client-ts";

const storageKey = `oidc.user:${import.meta.env.VITE_OIDC_AUTHORITY}:${import.meta.env.VITE_OIDC_CLIENT_ID}`;

export function getAccessToken(): string | undefined {
  const stored = sessionStorage.getItem(storageKey);
  if (!stored) {
    return undefined;
  }

  const user = User.fromStorageString(stored);
  return user.expired ? undefined : user.access_token;
}

export function clearStoredUser(): void {
  sessionStorage.removeItem(storageKey);
}