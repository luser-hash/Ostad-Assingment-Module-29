import { http } from "../../services/api/http";

/**
 * - GET /courses/:courseId/progress/list
 */
export async function getCourseProgressApi(courseId) {
  const { data } = await http.get(`/courses/${courseId}/progress/list/`);
  return data;
}