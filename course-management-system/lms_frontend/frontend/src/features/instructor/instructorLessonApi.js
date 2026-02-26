import { http } from "../../services/api/http";

/*
*  GET: /courses/course_id/lessons/
*  return lessons of a given course 
*/
export async function listLessonsApi(courseId) {
    const data = await http.get(`/courses/${courseId}/lessons/`);
    return data;
}

/*
* POST: /courses/course_id/lessons/create
*/
export async function createLessonApi(courseId, payload) {
  // payload: { title, description, video_url, duration, order }
  const { data } = await http.post(`courses/${courseId}/lessons/create`, payload);
  return data;
}

/*
* PATCH: /courses/course_id/lessons/lesson_id/manage/
* Update a given lesson 
*/
export async function updateLessonApi(courseId, lessonId, payload) {
  const { data } = await http.patch(`/courses/${courseId}/lessons/${lessonId}/manage/`, payload);
  return data;
}

/*
* DELETE: /courses/course_id/lessons/lesson_id/manage/
* Delete a given lesson 
*/
export async function deleteLessonApi(courseId, lessonId) {
  const { data } = await http.delete(`/courses/${courseId}/lessons/${lessonId}/manage/`);
  return data;
}