import { http } from "../../services/api/http";

export async function listMyInstructorCoursesApi() {
  // ✅ adjust to match your backend
  const { data } = await http.get("/instructor/courses/");
  return data;
}

export async function createCourseApi(payload) {
  // payload: { title, description }
  const { data } = await http.post("/courses/", payload);
  return data;
}

export async function updateCourseApi(courseId, payload) {
  // payload: { title?, description? }
  const { data } = await http.patch(`/courses/${courseId}/`, payload);
  return data;
}

export async function deleteCourseApi(courseId) {
  const { data } = await http.delete(`/courses/${courseId}/`);
  return data;
}