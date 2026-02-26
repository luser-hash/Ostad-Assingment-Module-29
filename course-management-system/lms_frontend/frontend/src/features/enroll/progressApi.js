import { http } from "../../services/api/http";

/*
 *  - POST /courses/:courseId/lessons/:lessonId/completed/
 */
export async function markLessonCompleteApi(courseId, lessonId) {
  const { data } = await http.post(`/courses/${courseId}/lessons/${lessonId}/completed/`);
  return data;
}