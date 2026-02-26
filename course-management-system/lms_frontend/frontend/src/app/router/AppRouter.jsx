import { createBrowserRouter, Navigate } from "react-router-dom";
import AppShell from "../layouts/AppShell";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";

import LoginPage from "../../pages/Login/LoginPage";
import RegisterPage from "../../pages/Register/RegisterPage";
import CourseListPage from "../../pages/CourseList/CourseListPage";
import CourseDetailsPage from "../../pages/CourseDetails/CourseDetailsPage";
import MyEnrolledCoursesPage from "../../pages/MyEnrolledCourses/MyEnrolledCoursesPage";
import InstructorCoursesPage from "../../pages/InstructorCourses/InstructorCoursesPage";
import LessonViewerPage from "../../pages/LessonViewer/LessonViewerPage";
import NotFoundPage from "../../pages/NotFoundPage";
import ToastHost from "../../shared/ui/ToastHost";

function Shell() {
  return (
    <AppShell>
      <MainLayout />
      <ToastHost/>
    </AppShell>
  );
}

export const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: "/", element: <Navigate to="/courses" replace /> },

      // public
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/courses", element: <CourseListPage /> },
      { path: "/courses/:courseId", element: <CourseDetailsPage /> },

      // protected
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/my-courses", element: <MyEnrolledCoursesPage /> },
          { path: "/courses/:courseId/lessons/:lessonId", element: <LessonViewerPage /> },

          // instructor-only
          {
            element: <RoleGuard allow={["instructor"]} />,
            children: [{ path: "/instructor/courses", element: <InstructorCoursesPage /> }],
          },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);