import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Spinner from "../../shared/ui/Spinner";
import Button from "../../shared/ui/Button";
import { getCourseApi } from "../../entities/course/courseApi";
import { listLessonsForCourseApi } from "../../entities/lesson/lessonApi";
import { enrollInCourseApi } from "../../features/enroll/enrollApi";
import { useAuth } from "../../app/providers/AuthProvider";

function Pill({ children }) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: "4px 8px",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        opacity: 0.85,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
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

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthed, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [enrolling, setEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState("");

  async function load() {
    setError("");
    setLoading(true);

    try {
      const c = await getCourseApi(courseId);
      setCourse(c);

      // 1) Try inline lessons first
      const inline = Array.isArray(c?.lessons) ? c.lessons : null;

      if (inline) {
        setLessons(inline);
      } else {
        // 2) Fallback to separate endpoint
        const data = await listLessonsForCourseApi(courseId);
        const items = Array.isArray(data) ? data : data?.results ?? [];
        setLessons(items);
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
  }, [courseId]);

  const canEnroll = useMemo(() => {
    // You can customize logic: only students can enroll
    if (!isAuthed) return true; // will redirect to login
    if (user?.role && user.role !== "student") return false;
    return true;
  }, [isAuthed, user]);

  async function handleEnroll() {
    setEnrollMsg("");

    if (!isAuthed) {
      navigate("/login", { replace: true, state: { from: `/courses/${courseId}` } });
      return;
    }

    if (!canEnroll) {
      setEnrollMsg("Only students can enroll.");
      return;
    }

    setEnrolling(true);
    try {
      await enrollInCourseApi(courseId);
      setEnrollMsg("Enrolled successfully!");
    } catch (e) {
      const msg = getMessageText(
        e?.response?.data?.detail ?? e?.response?.data?.message ?? e?.response?.data,
        "Enrollment failed."
      );
      setEnrollMsg(msg);
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) return <Spinner label="Loading course..." />;

  if (error) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            border: "1px solid #fecaca",
            background: "#fff1f2",
            color: "#991b1b",
            padding: 12,
            borderRadius: 14,
            fontWeight: 900,
          }}
        >
          {error}
        </div>
        <button
          onClick={load}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #111827",
            background: "white",
            fontWeight: 900,
            cursor: "pointer",
            width: "fit-content",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ opacity: 0.75, fontWeight: 800 }}>
        Course not found.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 1000 }}>
            {course.title ?? "Untitled course"}
          </h2>

          {course.description && (
            <div style={{ opacity: 0.8, lineHeight: 1.45 }}>{course.description}</div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {course.instructor_name && <Pill>{course.instructor_name}</Pill>}
            {typeof course.lessons_count === "number" && <Pill>{course.lessons_count} lessons</Pill>}
            {typeof course.price === "number" && <Pill>${course.price}</Pill>}
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, alignContent: "start", minWidth: 220 }}>
          <Button onClick={handleEnroll} loading={enrolling}>
            Enroll
          </Button>

          {enrollMsg && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: enrollMsg.toLowerCase().includes("success") ? "#16a34a" : "#991b1b",
              }}
            >
              {enrollMsg}
            </div>
          )}

          <Link to="/courses" style={{ fontSize: 13, fontWeight: 800 }}>
            ← Back to courses
          </Link>
        </div>
      </div>

      <section style={{ display: "grid", gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 1000 }}>Lessons</h3>

        {lessons.length === 0 ? (
          <div
            style={{
              border: "1px dashed #d1d5db",
              padding: 14,
              borderRadius: 14,
              opacity: 0.8,
              fontWeight: 800,
            }}
          >
            No lessons yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id ?? idx}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 1000 }}>
                    {lesson.title ?? `Lesson ${idx + 1}`}
                  </div>
                  {lesson.summary && (
                    <div style={{ fontSize: 13, opacity: 0.75 }}>{lesson.summary}</div>
                  )}
                </div>

                <Link
                  to={`/courses/${courseId}/lessons/${lesson.id}`}
                  style={{
                    textDecoration: "none",
                    fontWeight: 900,
                    fontSize: 13,
                    color: "white",
                    background: "#111827",
                    padding: "10px 12px",
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  Open lesson
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
