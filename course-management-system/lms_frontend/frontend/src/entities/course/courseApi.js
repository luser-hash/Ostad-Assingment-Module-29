import { http } from "../../services/api/http";

/**
 * - GET /courses/
 * - GET /courses/:id/
 */
export async function listCoursesApi() {
  const { data } = await http.get("/courses/");
  return data;
}

export async function getCourseApi(courseId) {
  const { data } = await http.get(`/courses/${courseId}/`);
  return data;
}