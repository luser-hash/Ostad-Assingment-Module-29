import { http } from "../../services/api/http";

/*
 * GET /courses/:courseId/lessons/
 * return list of lessons
 */
export async function listLessonsForCourseApi(courseId) {
  const { data } = await http.get(`/courses/${courseId}/lessons/`);
  return data;
}

/*
* GET /courses/course_id/lessons/lesson_id/
* return course scoped specific lesson
*/
export async function getLessonForCourseApi(courseId, lessonId) {
  const { data } = await http.get(`/courses/${courseId}/lessons/${lessonId}/`);
  return data;
}

/*
* GET /lessons/lesson_id
* return a lesson detail
*/
export async function getLessonApi(lessonId) {
  const { data } = await http.get(`/lessons/${lessonId}/`);
  return data;
}