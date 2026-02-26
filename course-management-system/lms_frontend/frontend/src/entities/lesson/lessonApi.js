import { http } from "../../services/api/http";

/*
 * GET /courses/:courseId/lessons/
 * return list of lessons
 */
export async function listLessonsForCourseApi(courseId) {
  const { data } = await http.get(`/courses/${courseId}/lessons/`);
  return data;
}