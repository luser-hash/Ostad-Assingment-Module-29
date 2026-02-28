import axios from "axios";
import { tokenStorage } from "./tokenStorage";
import { refreshAccessToken } from "./refreshToken";

const LOGGED_OUT_MESSAGE = "You're logged out. Please Log in.";

// axios instance
export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

function notifyLoggedOut() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logged-out"));
    }
}

function buildLoggedOutError(error) {
    const authError = new Error(LOGGED_OUT_MESSAGE);
    authError.code = "AUTH_LOGGED_OUT";
    authError.response = {
        ...(error?.response ?? {}),
        data: {
            ...(error?.response?.data ?? {}),
            detail: LOGGED_OUT_MESSAGE,
            message: LOGGED_OUT_MESSAGE,
        },
    };
    authError.originalError = error;
    return authError;
}

function clearAuthAndReject(error) {
    tokenStorage.clear();
    notifyLoggedOut();
    return Promise.reject(buildLoggedOutError(error));
}

// token injection at requests
// Silent Refresh without handling token expiry everywhere
http.interceptors.request.use((config) => {
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        if (config.headers?.set) {
            config.headers.set("Content-Type", undefined);
        } else if (config.headers) {
            delete config.headers["Content-Type"];
        }
    }

    if (!config.skipAuthHeader) {
        const token = tokenStorage.getAccess();
        if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

// prevent multiple refreshs in parallel
let refreshing = false;
let queue = [];

function flushQueue(error, token=null) {
    queue.forEach((p) => ( error ? p.reject(error) : p.resolve(token)));
    queue = [];
}

http.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config ?? {};

        // if no response or not 401
        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        // do not refresh on refresh endpoint (or explicitly skipped requests)
        if (
            original.skipAuthRefresh ||
            (typeof original.url === "string" && original.url.includes("/auth/token/refresh/"))
        ) {
            return clearAuthAndReject(error);
        }

        // AVoid infinit loop
        if (original._retry) {
            return clearAuthAndReject(error);
        }

        original._retry = true;

        // if refresh already running, wait
        if (refreshing) {
            return new Promise((resolve, reject) => {
                queue.push({
                    resolve: (token) => {
                        if (!token) {
                            reject(buildLoggedOutError(error));
                            return;
                        }
                        original.headers = original.headers ?? {};
                        original.headers.Authorization = `Bearer ${token}`;
                        resolve(http(original));
                    },
                    reject,
                });
            });
        }

        refreshing = true;

        try {
            const data = await refreshAccessToken();
            const newAccess = data.access;
            if (!newAccess) {
                throw new Error("Refresh did not return an access token.");
            }
            tokenStorage.setAccess(newAccess);

            flushQueue(null, newAccess);

            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${newAccess}`;
            return http(original);
        } catch (e) {
            flushQueue(e, null);
            return clearAuthAndReject(e);
        } finally {
            refreshing = false;
        }
    }
);
