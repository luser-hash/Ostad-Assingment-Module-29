import { http } from "../../services/api/http";

/*
 *  - POST /auth/register/
 *  - POST /auth/token/
 *  - GET  /me/
 */

export async function registerApi(payload) {
  // payload: { username,email, password, role? }
  const { data } = await http.post("/auth/register/", payload);
  return data;
}

export async function loginApi(payload) {
  // payload: { username, password }
  // POST /token/ -> { access, refresh }
  const { data } = await http.post("/auth/token/", payload);
  return data;
}

export async function meApi() {
  const { data } = await http.get("/me/");
  return data;
}