# Learning Hub LMS

A full-stack Learning Management System (LMS) built with Django REST Framework and React. The platform supports two user roles:

- `student`: browse courses, enroll, watch lessons, and track progress
- `instructor`: create courses, manage lessons, and maintain course content

This project is structured as a backend API plus a separate frontend SPA.

## Local Setup

## Prerequisites

- Python 3
- Node.js
- npm

## Backend Setup

```bash
cd course-management-system/lms
python -m venv .venv
.venv\Scripts\activate
pip install django djangorestframework djangorestframework-simplejwt pillow django-cors-headers
python manage.py migrate
python manage.py runserver
```

Backend runs by default at:

```text
http://127.0.0.1:8000/
```

## Frontend Setup

```bash
cd course-management-system/lms_frontend/frontend
npm install
npm run dev
```

Frontend runs by default at:

```text
http://127.0.0.1:5173/
```

## Environment Variables

### Frontend

Create a `.env` file inside `course-management-system/lms_frontend/frontend`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### Backend

The backend reads environment variables directly from the system environment. Common settings used by the project include:

```env
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
JWT_REFRESH_COOKIE_SECURE=false
JWT_REFRESH_COOKIE_SAMESITE=Lax
CSRF_COOKIE_SECURE=false
```


## Features

- User registration and login with role selection
- JWT authentication with refresh-token cookie support
- Public course catalog with pagination and search
- Course details page with lesson list
- Instructor-only course creation, editing, and deletion
- Instructor-only lesson creation and editing
- Student-only course enrollment
- Student-only lesson completion tracking
- Course progress calculation by completed lessons
- Protected and role-based frontend routes
- Thumbnail upload support for courses

## Tech Stack

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- SQLite
- CORS Headers

### Frontend

- React
- Vite
- React Router
- Axios
- React Hook Form
- Zod
- Tailwind CSS

## Project Structure

```text
.
├── course-management-system/
│   ├── lms/                    # Django backend
│   │   ├── courses/            # Course, lesson, enrollment, progress logic
│   │   ├── users/              # Custom user model and auth APIs
│   │   ├── lms/                # Django project settings and URL config
│   │   ├── media/              # Uploaded course thumbnails
│   │   └── manage.py
│   └── lms_frontend/
│       └── frontend/           # React frontend
└── README.md
```

## User Roles

### Student

- Register and log in
- Browse available courses
- Enroll in a course
- Open lessons inside enrolled courses
- Mark lessons as complete
- View course progress
- Access enrolled courses from a dedicated dashboard

### Instructor

- Register and log in
- Create new courses
- Upload course thumbnails
- Edit or delete owned courses
- Add lessons to owned courses
- Edit lesson order, duration, and video URL
- Manage course content from the instructor dashboard

## Core Data Model

The backend uses four main course-related models:

- `Course`: title, description, thumbnail, instructor, created date
- `Lessons`: course lesson with title, video URL, duration, and order
- `Enrollment`: student-course relationship
- `LessonProgress`: completion state for a student on a lesson

Business rules enforced in the backend include:

- a student cannot enroll in the same course twice
- two lessons in the same course cannot share the same order
- a student cannot mark the same lesson complete twice
- a student must be enrolled before progress can be recorded
- lessons are completed sequentially

## Authentication

Authentication is implemented with Simple JWT:

- access token is stored in browser storage
- refresh token is stored in an `HttpOnly` cookie
- expired access tokens are refreshed automatically on the frontend
- logout blacklists the refresh token when available


## Main API Endpoints

### Auth

- `POST /api/auth/register/`
- `POST /api/auth/token/`
- `POST /api/auth/token/refresh/`
- `POST /api/auth/logout/`
- `GET /api/me/`

### Courses

- `GET /api/courses/`
- `GET /api/courses/<id>/`
- `POST /api/courses/create/`
- `PATCH /api/courses/<id>/manage/`
- `DELETE /api/courses/<id>/manage/`
- `GET /api/instructor/courses/`

### Lessons

- `GET /api/courses/<course_id>/lessons/`
- `POST /api/courses/<course_id>/lessons/create`
- `PATCH /api/courses/<course_id>/lessons/<lesson_id>/manage/`
- `DELETE /api/courses/<course_id>/lessons/<lesson_id>/manage/`
- `GET /api/courses/<course_id>/lessons/<lesson_id>/`

### Enrollment and Progress

- `POST /api/courses/<id>/enrollment/`
- `GET /api/myenrollments/`
- `POST /api/courses/<course_id>/lessons/<lesson_id>/completed/`
- `GET /api/courses/<course_id>/progress/`
- `GET /api/courses/<course_id>/progress/list/`

## Frontend Pages

- `/courses` - public course catalog
- `/courses/:courseId` - course details
- `/login` - login page
- `/register` - registration page
- `/my-courses` - student enrolled courses
- `/instructor/courses` - instructor dashboard
- `/courses/:courseId/lessons/:lessonId` - lesson viewer


## How It Works

1. A user registers as either a student or instructor.
2. The user logs in and receives an access token plus a refresh cookie.
3. Students browse courses and enroll in a course.
4. Instructors create courses and attach lessons to them.
5. Students open lessons and mark them complete in order.
6. The system calculates progress based on completed lessons versus total lessons.

## Admin Support

The project also registers models in Django Admin, so admins can inspect:

- users
- courses
- lessons
- enrollments
- lesson progress

## Current Scope

This project is an LMS MVP. It currently focuses on course delivery and progress tracking.

## Repository Notes

- Backend code lives under `course-management-system/lms`
- Frontend code lives under `course-management-system/lms_frontend/frontend`
- Uploaded media is stored under `course-management-system/lms/media`

## License

This project is licensed under the MIT License.
