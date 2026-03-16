export const BACKEND_AUTH_COOKIE = "arabia_backend_access_token";
const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8002";

export function getBackendBaseUrl() {
    const configuredUrl = process.env.AIVA_BACKEND_URL?.trim();
    return (configuredUrl || DEFAULT_BACKEND_BASE_URL).replace(/\/+$/, "");
}

export function buildBackendUrl(path: string) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${getBackendBaseUrl()}${normalizedPath}`;
}
