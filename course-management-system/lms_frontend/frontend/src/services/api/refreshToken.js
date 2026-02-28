import { http } from "./http";

/*
* REFRESH ENDPOINT:
* POST: /auth/token/refresh/
*/
export async function refreshAccessToken() {
    const { data } = await http.post(
        "/auth/token/refresh/",
        {},
        { skipAuthHeader: true, skipAuthRefresh: true }
    );
    return data;
}
