import { http } from "./http";
import { tokenStorage } from "./tokenStorage";

/*
* REFRESH ENDPOINT:
* POST: /auth/token/refresh/
*/
export async function refreshAccessToken() {
    const refresh = tokenStorage.getRefresh();
    if (!refresh) throw new Error("No Refresh Token");

    const data = await http.post("/auth/token/refresh/", {refresh});
    return data;
}