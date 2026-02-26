import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Spinner from "../../shared/ui/Spinner";
import Button from "../../shared/ui/Button";

import {
  getLessonApi,
  getLessonForCourseApi,
  listLessonsForCourseApi,
} from "../../entities/lesson/lessonApi";

import { markLessonCompleteApi } from "../../features/enroll/progressApi";

function toMessageText(value, fallback) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(String).join(" ");
  if (value && typeof value === "object") {
    return Object.values(value).flat().map(String).join(" ") || fallback;
  }
  return fallback;
}

function LessonNavButton({ to, label, disabled }) {
  if (disabled) {
    return (
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          opacity: 0.5,
          fontWeight: 900,
        }}
      >
        {label}
      </div>
    );
  }

  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: "white",
        fontWeight: 900,
        color: "#111827",
      }}
    >
      {label}
    </Link>
  );
}

export default function LessonViewerPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [lessonList, setLessonList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [completing, setCompleting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  async function load() {
    setError("");
    setStatusMsg("");
    setLoading(true);

    try {
      // Always load lesson list for prev/next (fallback-friendly)
      let list = [];
      try {
        const data = await listLessonsForCourseApi(courseId);
        list = Array.isArray(data) ? data : data?.results ?? [];
      } catch {
        // If endpoint doesn't exist, prev/next will be limited
        list = [];
      }
      setLessonList(list);

      // Load lesson detail: course-scoped first, then global
      try {
        const l = await getLessonForCourseApi(courseId, lessonId);
        setLesson(l);
      } catch {
        const l = await getLessonApi(lessonId);
        setLesson(l);
      }
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to load lesson.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId]);

  const nav = useMemo(() => {
    if (!lessonList?.length) return { prev: null, next: null };

    const idx = lessonList.findIndex((l) => String(l.id) === String(lessonId));
    if (idx === -1) return { prev: null, next: null };

    const prev = idx > 0 ? lessonList[idx - 1] : null;
    const next = idx < lessonList.length - 1 ? lessonList[idx + 1] : null;

    return { prev, next };
  }, [lessonList, lessonId]);

  async function markComplete() {
    setStatusMsg("");
    setCompleting(true);
    try {
      await markLessonCompleteApi(courseId, lessonId);
      setStatusMsg("Marked complete.");

      if (nav.next) {
        // small delay so user sees feedback
        setTimeout(() => {
          navigate(`/courses/${courseId}/lessons/${nav.next.id}`);
        }, 400);
      }
    } catch (e) {
      const msg = toMessageText(
        e?.response?.data?.detail ??
          e?.response?.data?.message ??
          e?.response?.data,
        "Could not update progress (check endpoint)."
      );
      setStatusMsg(msg);
    } finally {
      setCompleting(false);
    }
  }

  if (loading) return <Spinner label="Loading lesson..." />;

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
            fontWeight: 1000,
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

  if (!lesson) {
    return <div style={{ opacity: 0.75, fontWeight: 900 }}>Lesson not found.</div>;
  }

  // Content rendering:
  // If backend returns HTML, we show it as plain text by default (safe).
  // Later you can add a sanitizer if you truly need raw HTML rendering.
  const content =
    lesson.content ?? lesson.body ?? lesson.text ?? lesson.description ?? "";
  const statusText = typeof statusMsg === "string" ? statusMsg : toMessageText(statusMsg, "");
  const isSuccessStatus = statusText.toLowerCase().includes("complete");

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 6 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 1000 }}>
            {lesson.title ?? "Lesson"}
          </h2>
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            <Link to={`/courses/${courseId}`} style={{ fontWeight: 900 }}>
              ← Back to course
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <LessonNavButton
            label="← Prev"
            disabled={!nav.prev}
            to={nav.prev ? `/courses/${courseId}/lessons/${nav.prev.id}` : "#"}
          />
          <LessonNavButton
            label="Next →"
            disabled={!nav.next}
            to={nav.next ? `/courses/${courseId}/lessons/${nav.next.id}` : "#"}
          />
        </div>
      </div>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 14,
          background: "white",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}
      >
        {content || <span style={{ opacity: 0.75 }}>No content.</span>}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <Button onClick={markComplete} loading={completing}>
          Mark complete
        </Button>

        {statusText && (
          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: isSuccessStatus ? "#16a34a" : "#991b1b",
            }}
          >
            {statusText}
          </div>
        )}

        {nav.next && (
          <button
            onClick={() => navigate(`/courses/${courseId}/lessons/${nav.next.id}`)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Go to next
          </button>
        )}
      </div>
    </div>
  );
}
