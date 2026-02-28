import { http } from "../../services/api/http";

function toFormData(payload) {
  const formData = new FormData();

  Object.entries(payload ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "thumbnail") {
      const isBlob = typeof Blob !== "undefined" && value instanceof Blob;
      if (!isBlob) return;
    }
    formData.append(key, value);
  });

  return formData;
}

export async function listMyInstructorCoursesApi() {
  const { data } = await http.get("/instructor/courses/");
  return data;
}

export async function createCourseApi(payload) {
  // payload: { title, description, thumbnail }
  const body = toFormData(payload);
  const { data } = await http.post("/courses/create/", body);
  return data;
}

export async function updateCourseApi(courseId, payload) {
  // payload: { title?, description?, thumbnail? }
  const body = toFormData(payload);
  const { data } = await http.patch(`/courses/${courseId}/manage/`, body);
  return data;
}

export async function deleteCourseApi(courseId) {
  const { data } = await http.delete(`/courses/${courseId}/manage/`);
  return data;
}
