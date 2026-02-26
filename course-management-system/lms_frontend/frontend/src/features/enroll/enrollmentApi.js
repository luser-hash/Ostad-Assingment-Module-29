import { http } from "../../services/api/http";

/*
 * - /myenrollments/
 */
export async function listMyEnrollmentsApi() {
  const { data } = await http.get("/myenrollments/");
  return data;
}

/*
 * GET /courses/:courseId/progress/
 */
export async function getCourseProgressApi(courseId) {
  const { data } = await http.get(`/courses/${courseId}/progress/`);
  return data;
}
