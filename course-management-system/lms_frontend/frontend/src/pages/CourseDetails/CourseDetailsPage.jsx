import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Spinner from "@/components/ui/spinner";
import Button from "@/components/ui/button-loading";
import { getCourseApi } from "../../entities/course/courseApi";
import { listLessonsForCourseApi } from "../../entities/lesson/lessonApi";
import { enrollInCourseApi } from "../../features/enroll/enrollApi";
import { useAuth } from "../../app/providers/AuthProvider";
import ManageLessonsPanel from "../../features/instructor/ManageLessonsPanel";
import { getCourseProgressApi } from "../../features/enroll/progressReadApi";
import { toastShow } from "@/components/ui/toast-store";

function Pill({ children }) {
  return (
    <span className="whitespace-nowrap rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
      {children}
    </span>
  );
}

function getMessageText(value, fallback = "") {
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    const text = value.map((item) => getMessageText(item)).filter(Boolean).join(" ");
    return text || fallback;
  }

  if (value && typeof value === "object") {
    if ("detail" in value) {
      return getMessageText(value.detail, fallback);
    }
    if ("message" in value) {
      return getMessageText(value.message, fallback);
    }

    const firstValue = Object.values(value)[0];
    return getMessageText(firstValue, fallback);
  }

  if (value == null) return fallback;
  return String(value);
}

function truncateText(text, max = 40) {
  const value = String(text ?? "");
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthed, user } = useAuth();
  const role = user?.role;
  const isStudent = role === "student";
  const isInstructor = role === "instructor";

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [enrolling, setEnrolling] = useState(false);

  const [completedSet, setCompletedSet] = useState(new Set());
  const [progressLoading, setProgressLoading] = useState(false);
  const [lessonCreateRequestKey, setLessonCreateRequestKey] = useState(0);
  const [lessonEditRequest, setLessonEditRequest] = useState(null);

  function scrollToManageLessons() {
    const el = document.getElementById("manage-lessons-panel");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function load() {
    setError("");
    setLoading(true);

    try {
      const c = await getCourseApi(courseId);
      setCourse(c);

      const inline = Array.isArray(c?.lessons) ? c.lessons : null;

      if (inline) {
        setLessons(inline);
      } else {
        const data = await listLessonsForCourseApi(courseId);
        const items = Array.isArray(data) ? data : data?.results ?? [];
        setLessons(items);
      }

      if (isAuthed && isStudent) {
        setProgressLoading(true);
        try {
          const p = await getCourseProgressApi(courseId);
          const ids = Array.isArray(p?.completed_lessons)
            ? p.completed_lessons
            : Array.isArray(p)
              ? p.filter((x) => x.completed).map((x) => x.lesson)
              : [];

          setCompletedSet(new Set(ids.map(String)));
        } catch {
          setCompletedSet(new Set());
        } finally {
          setProgressLoading(false);
        }
      } else {
        setCompletedSet(new Set());
        setProgressLoading(false);
      }
    } catch (e) {
      const msg = getMessageText(
        e?.response?.data?.detail ?? e?.response?.data?.message ?? e?.response?.data,
        "Failed to load course details."
      );
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, isAuthed, isStudent]);

  const canEnroll = useMemo(() => {
    if (!isAuthed) return true;
    if (user?.role && user.role !== "student") return false;
    return true;
  }, [isAuthed, user]);

  const isCourseOwner = useMemo(() => {
    if (!isInstructor || !course?.instructor || !user?.id) return false;
    return String(course.instructor) === String(user.id);
  }, [course?.instructor, isInstructor, user?.id]);

  async function handleEnroll() {
    if (!isAuthed) {
      navigate("/login", { replace: true, state: { from: `/courses/${courseId}` } });
      return;
    }

    if (!canEnroll) {
      toastShow("Only students can enroll.", "error");
      return;
    }

    setEnrolling(true);
    try {
      await enrollInCourseApi(courseId);
      toastShow("Enrolled successfully!", "success");
    } catch (e) {
      const msg = getMessageText(
        e?.response?.data?.detail ?? e?.response?.data?.message ?? e?.response?.data,
        "Enrollment failed."
      );
      toastShow(msg, "error");
    } finally {
      setEnrolling(false);
    }
  }

  function handleAddLesson() {
    setLessonEditRequest(null);
    setLessonCreateRequestKey((v) => v + 1);
    setTimeout(scrollToManageLessons, 0);
  }

  function handleEditLesson(lesson) {
    if (!lesson?.id) return;
    setLessonEditRequest({ lessonId: lesson.id, key: Date.now() });
    setTimeout(scrollToManageLessons, 0);
  }

  function handleLessonCreated(created) {
    if (!created) return;
    setLessons((prev) => [...prev, created].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  }

  function handleLessonUpdated(updated) {
    if (!updated?.id) return;
    setLessons((prev) =>
      prev
        .map((lesson) => (lesson.id === updated.id ? updated : lesson))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    );
  }

  if (loading) return <Spinner label="Loading course..." />;

  if (error) {
    return (
      <div className="grid gap-3">
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 font-semibold text-destructive">
          {error}
        </div>
        <button
          onClick={load}
          className="w-fit rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!course) {
    return <div className="text-sm font-semibold text-muted-foreground">Course not found.</div>;
  }

  return (
    <div className="lms-page">
      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-cyan-50 to-amber-50 p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="grid min-w-[260px] flex-1 gap-3">
            <Link to="/courses" className="text-xs font-bold text-primary no-underline hover:underline">
              ← Back to courses
            </Link>

            <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
              {course.title ?? "Untitled course"}
            </h2>

            <div className="flex flex-wrap gap-2">
              {course.instructor_name && <Pill>{course.instructor_name}</Pill>}
              {typeof course.lessons_count === "number" && <Pill>{course.lessons_count} lessons</Pill>}
              {typeof course.price === "number" && <Pill>${course.price}</Pill>}
            </div>

            {course.description && (
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{course.description}</p>
            )}
          </div>

          <div className="grid content-start gap-2">
            {(!isAuthed || isStudent) && (
              <Button onClick={handleEnroll} loading={enrolling} className="rounded-xl">
                Enroll
              </Button>
            )}

            {isCourseOwner && (
              <button
                type="button"
                onClick={handleAddLesson}
                className="rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                + Add New Lesson
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-extrabold tracking-tight">Lessons</h3>
          {isStudent && progressLoading && (
            <span className="text-xs font-semibold text-muted-foreground">Loading progress...</span>
          )}
        </div>

        {lessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-4 text-sm font-semibold text-muted-foreground">
            No lessons yet.
          </div>
        ) : (
          <div className="grid gap-2.5">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id ?? idx}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-sm"
              >
                <div className="grid gap-1">
                  <div className="flex items-center gap-2 text-sm font-extrabold">
                    <span title={lesson.title ?? `Lesson ${idx + 1}`}>
                      {truncateText(lesson.title ?? `Lesson ${idx + 1}`)}
                    </span>
                    {isStudent && completedSet.has(String(lesson.id)) && (
                      <span className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-black text-emerald-700">
                        Completed
                      </span>
                    )}
                  </div>
                  {lesson.summary && <div className="text-xs text-muted-foreground">{lesson.summary}</div>}
                </div>

                <div className="flex flex-wrap gap-2">
                  {isCourseOwner && (
                    <button
                      type="button"
                      onClick={() => handleEditLesson(lesson)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Edit lesson
                    </button>
                  )}

                  <Link
                    to={`/courses/${courseId}/lessons/${lesson.id}`}
                    className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground no-underline transition-opacity hover:opacity-90"
                  >
                    Open lesson
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isAuthed && isCourseOwner && (
        <ManageLessonsPanel
          courseId={courseId}
          createRequestKey={lessonCreateRequestKey}
          editRequest={lessonEditRequest}
          onLessonCreated={handleLessonCreated}
          onLessonUpdated={handleLessonUpdated}
        />
      )}
    </div>
  );
}
