import type { AuthProviderProps } from "react-oidc-context";
import { router } from "../router";

function getReturnTo(state: unknown) {
  if (typeof state === "object" && state !== null && "returnTo" in state) {
    const { returnTo } = state;
    if (typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
      return returnTo;
    }
  }
  return "/";
}

export const oidcConfig: AuthProviderProps = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: `${window.location.origin}/`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  response_type: "code",
  scope: "openid profile email",
  automaticSilentRenew: true,
  onSigninCallback: (user) => {
    void router.navigate(getReturnTo(user?.state), { replace: true });
  },
};