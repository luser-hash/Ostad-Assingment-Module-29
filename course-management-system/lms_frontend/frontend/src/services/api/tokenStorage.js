export const tokenStorage = {
    getAccess() {
        return localStorage.getItem("access_token");
    },
    getRefresh() {
        return localStorage.getItem("refresh_token");
    },
    setTokens({ access, refresh }) {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
    },
    clear() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    },
};