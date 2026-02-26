import axios from "axios";
import { tokenStorage } from "./tokenStorage";
import { refreshAccessToken } from "./refreshToken";

// axios instance
export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// token injection at requests
// Silent Refresh without handling token expiry everywhere
http.interceptors.request.use((config) => {
    const token = tokenStorage.getAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
        const original = error.config;

        // if no response or not 401
        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        // AVoid infinit loop
        if (original._retry) {
            tokenStorage.clear();
            return Promise.reject(error);
        }
        original._retry = true;

        // if refresh already running, wait
        if (refreshing) {
            return new Promise((resolve, reject) => {
                queue.push({
                    resolve: (token) => {
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
            const maybeRefresh = data.refresh ?? tokenStorage.getRefresh();

            tokenStorage.setTokens({ access: newAccess, refresh: maybeRefresh});

            flushQueue(null, newAccess);

            original.headers.Authorization = `Bearer ${newAccess}`;
            return http(original);
        } catch (e) {
            flushQueue(e, null);
            tokenStorage.clear();
            return Promise.reject(error);
        } finally {
            refreshing = false;
        }
    }
);
