import axios from "axios";
import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalConfig, apiTokenRequest } from "./authConfig";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const msalInstance = new PublicClientApplication(msalConfig);

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach a fresh Entra ID access token to every request.
apiClient.interceptors.request.use(async (config) => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) return config;

  try {
    const result = await msalInstance.acquireTokenSilent({
      ...apiTokenRequest,
      account: accounts[0],
    });
    config.headers.Authorization = `Bearer ${result.accessToken}`;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const result = await msalInstance.acquireTokenPopup(apiTokenRequest);
      config.headers.Authorization = `Bearer ${result.accessToken}`;
    } else {
      console.error("Failed to acquire token", error);
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — user may need to sign in again.");
    }
    return Promise.reject(error);
  }
);
