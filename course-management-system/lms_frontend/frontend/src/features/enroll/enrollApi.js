import { http } from "../../services/api/http";

/*
 * POST /courses/:id/enrollment/
 */
export async function enrollInCourseApi(courseId) {
  const { data } = await http.post(`/courses/${courseId}/enrollment/`);
  return data;
}