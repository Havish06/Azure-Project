import { Configuration, PopupRequest } from "@azure/msal-browser";

// Values are supplied via .env.local (see .env.local.example)
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_ENTRA_TENANT_ID || "common"}`,
    redirectUri: process.env.NEXT_PUBLIC_ENTRA_REDIRECT_URI || "http://localhost:3000",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Scope requested for calling our own backend API
export const loginRequest: PopupRequest = {
  scopes: [process.env.NEXT_PUBLIC_ENTRA_API_SCOPE || "openid", "profile"],
};

export const apiTokenRequest: PopupRequest = {
  scopes: [process.env.NEXT_PUBLIC_ENTRA_API_SCOPE || "openid"],
};
