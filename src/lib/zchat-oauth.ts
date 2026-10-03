import { supabaseUrl } from "@/lib/supabase";

const OAUTH_TRANSACTION_KEY = "z-games:zchat-oauth-transaction";
const OAUTH_SESSION_KEY = "z-games:zchat-oauth-session";
const AUTH_CHANGE_EVENT = "z-games:zchat-auth-change";
let refreshInFlight: Promise<OAuthTokens> | null = null;

type OAuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

type OAuthTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error_description?: string;
  msg?: string;
};

type UserInfo = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
};

export type ZChatUser = {
  id: string;
  email: string | undefined;
  user_metadata: Record<string, string | undefined>;
};

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function randomString(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

function safeReturnPath(path: string | null | undefined) {
  return path && path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

function oauthClientId() {
  return import.meta.env.VITE_ZCHAT_OAUTH_CLIENT_ID;
}

function readTokens(): OAuthTokens | null {
  const saved = localStorage.getItem(OAUTH_SESSION_KEY);
  if (!saved) return null;
  try {
    const tokens = JSON.parse(saved) as OAuthTokens;
    return tokens.access_token && tokens.refresh_token && Number.isFinite(tokens.expires_at) ? tokens : null;
  } catch {
    localStorage.removeItem(OAUTH_SESSION_KEY);
    return null;
  }
}

function storeTokens(payload: OAuthTokenResponse): OAuthTokens {
  if (!payload.access_token || !payload.refresh_token) throw new Error("ZChat did not return a complete sign-in session.");
  const tokens = {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_at: Date.now() + Math.max(payload.expires_in ?? 3600, 0) * 1000,
  };
  localStorage.setItem(OAUTH_SESSION_KEY, JSON.stringify(tokens));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  return tokens;
}

async function refreshOAuthTokens(refreshToken: string) {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const clientId = oauthClientId();
      if (!clientId) throw new Error("ZChat sign-in is not configured yet.");
      const response = await fetch(new URL("/auth/v1/oauth/token", supabaseUrl), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: clientId }),
      });
      const payload = await response.json() as OAuthTokenResponse;
      if (!response.ok) throw new Error(payload.error_description ?? payload.msg ?? "Your ZChat session expired. Please sign in again.");
      return storeTokens(payload);
    })();
  }
  const pendingRefresh = refreshInFlight;
  try {
    return await pendingRefresh;
  } finally {
    if (refreshInFlight === pendingRefresh) refreshInFlight = null;
  }
}
export async function getZChatOAuthUser(): Promise<ZChatUser | null> {
  let tokens = readTokens();
  if (!tokens) return null;
  if (tokens.expires_at <= Date.now() + 30_000) tokens = await refreshOAuthTokens(tokens.refresh_token);

  let response = await fetch(new URL("/auth/v1/oauth/userinfo", supabaseUrl), {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (response.status === 401) {
    tokens = await refreshOAuthTokens(tokens.refresh_token);
    response = await fetch(new URL("/auth/v1/oauth/userinfo", supabaseUrl), {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
  }
  if (!response.ok) {
    localStorage.removeItem(OAUTH_SESSION_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    throw new Error("Could not verify your ZChat session. Please sign in again.");
  }

  const info = await response.json() as UserInfo;
  if (!info.sub) throw new Error("ZChat returned an invalid account profile.");
  return {
    id: info.sub,
    email: info.email,
    user_metadata: { display_name: info.name, avatar_url: info.picture },
  };
}

export function subscribeToZChatAuth(listener: () => void) {
  window.addEventListener(AUTH_CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function signOutOfZChatOnThisDevice() {
  localStorage.removeItem(OAUTH_SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export async function beginZChatSignIn(returnTo = "/") {
  const clientId = oauthClientId();
  if (!clientId) throw new Error("ZChat sign-in is not configured yet. Register Z Games in Supabase and set VITE_ZCHAT_OAUTH_CLIENT_ID.");

  const codeVerifier = randomString(48);
  const state = randomString(32);
  const challengeBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));
  const codeChallenge = toBase64Url(new Uint8Array(challengeBytes));
  const redirectUri = `${window.location.origin}/auth/zchat/callback`;

  sessionStorage.setItem(OAUTH_TRANSACTION_KEY, JSON.stringify({
    codeVerifier,
    state,
    redirectUri,
    returnTo: safeReturnPath(returnTo),
  }));

  const authorizationUrl = new URL("/auth/v1/oauth/authorize", supabaseUrl);
  authorizationUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  }).toString();
  window.location.assign(authorizationUrl.toString());
}

export async function completeZChatSignIn() {
  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get("error_description") ?? params.get("error");
  if (oauthError) throw new Error(oauthError);

  const code = params.get("code");
  const returnedState = params.get("state");
  const rawTransaction = sessionStorage.getItem(OAUTH_TRANSACTION_KEY);
  if (!code || !returnedState || !rawTransaction) {
    throw new Error("The ZChat sign-in response is incomplete. Please try again.");
  }

  const transaction = JSON.parse(rawTransaction) as {
    codeVerifier: string;
    state: string;
    redirectUri: string;
    returnTo: string;
  };
  if (returnedState !== transaction.state) {
    sessionStorage.removeItem(OAUTH_TRANSACTION_KEY);
    throw new Error("The ZChat sign-in could not be verified. Please try again.");
  }

  const clientId = oauthClientId();
  if (!clientId) throw new Error("ZChat sign-in is not configured yet.");

  const response = await fetch(new URL("/auth/v1/oauth/token", supabaseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      redirect_uri: transaction.redirectUri,
      code_verifier: transaction.codeVerifier,
    }),
  });
  const payload = await response.json() as OAuthTokenResponse;
  if (!response.ok) throw new Error(payload.error_description ?? payload.msg ?? "Could not finish ZChat sign-in. Please try again.");

  storeTokens(payload);
  const user = await getZChatOAuthUser();
  if (!user) throw new Error("Could not verify your ZChat sign-in.");

  sessionStorage.removeItem(OAUTH_TRANSACTION_KEY);
  return safeReturnPath(transaction.returnTo);
}
