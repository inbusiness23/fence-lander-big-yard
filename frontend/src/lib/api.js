const BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.trim();

export const hasBackendUrl = Boolean(BACKEND_URL);
export const API = hasBackendUrl ? `${BACKEND_URL}/api` : "";

export const backendUrlHelpText =
  "System setup incomplete. Please set REACT_APP_BACKEND_URL in Vercel project settings.";
