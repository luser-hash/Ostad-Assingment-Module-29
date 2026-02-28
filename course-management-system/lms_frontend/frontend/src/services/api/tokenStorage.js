export const tokenStorage = {
    getAccess() {
        return localStorage.getItem("access_token");
    },
    setAccess(access) {
        if (!access) return;
        localStorage.setItem("access_token", access);
        // Cleanup old storage model (refresh token moved to HttpOnly cookie).
        localStorage.removeItem("refresh_token");
    },
    setTokens({ access }) {
        this.setAccess(access);
    },
    clear() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    },
};
