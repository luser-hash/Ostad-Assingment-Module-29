import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Spinner from "@/components/ui/spinner";
import Button from "@/components/ui/button-loading";

import {
  getLessonApi,
  getLessonForCourseApi,
  listLessonsForCourseApi,
} from "../../entities/lesson/lessonApi";

import { markLessonCompleteApi } from "../../features/enroll/progressApi";
import { toastShow } from "@/components/ui/toast-store";
import { useAuth } from "../../app/providers/AuthProvider";

function toMessageText(value, fallback) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(String).join(" ");
  if (value && typeof value === "object") {
    return Object.values(value).flat().map(String).join(" ") || fallback;
  }
  return fallback;
}

function normalizeLessonResponse(data) {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] ?? null;
  if (Array.isArray(data?.results)) return data.results[0] ?? null;
  return typeof data === "object" ? data : null;
}

function formatDuration(minutes) {
  if (minutes == null || Number.isNaN(Number(minutes))) return "";
  const totalMinutes = Number(minutes);
  if (!Number.isFinite(totalMinutes)) return "";
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins ? `${hours}h ${mins} min` : `${hours}h`;
}

function isDirectVideoFile(url) {
  if (typeof url !== "string") return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function toEmbeddableVideoUrl(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return "";

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = url.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;

      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) return rawUrl;
    }

    if (host === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (host === "vimeo.com") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }

    if (host === "player.vimeo.com") return rawUrl;

    return rawUrl;
  } catch {
    return "";
  }
}

function MetaPill({ children }) {
  return (
    <span className="rounded-full border border-border/80 bg-muted/60 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
      {children}
    </span>
  );
}

function LessonNavButton({ to, label, disabled }) {
  if (disabled) {
    return (
      <div className="rounded-xl border border-border/70 bg-background px-3 py-2 text-xs font-bold text-muted-foreground opacity-60">
        {label}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {label}
    </Link>
  );
}

export default function LessonViewerPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  const [lesson, setLesson] = useState(null);
  const [lessonList, setLessonList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [completing, setCompleting] = useState(false);

  async function load() {
    setError("");
    setLoading(true);

    try {
      let list = [];
      try {
        const data = await listLessonsForCourseApi(courseId);
        list = Array.isArray(data) ? data : data?.results ?? [];
      } catch {
        list = [];
      }
      setLessonList(list);

      try {
        const l = await getLessonForCourseApi(courseId, lessonId);
        setLesson(normalizeLessonResponse(l));
      } catch {
        const l = await getLessonApi(lessonId);
        setLesson(normalizeLessonResponse(l));
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
    if (!isStudent) {
      toastShow("Only students can mark lessons complete.", "error");
      return;
    }

    setCompleting(true);
    try {
      await markLessonCompleteApi(courseId, lessonId);
      toastShow("Marked complete.", "success");

      if (nav.next) {
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
      toastShow(msg, "error");
    } finally {
      setCompleting(false);
    }
  }

  if (loading) return <Spinner label="Loading lesson..." />;

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

  if (!lesson) {
    return <div className="text-sm font-semibold text-muted-foreground">Lesson not found.</div>;
  }

  const videoUrl = lesson.video_url ?? lesson.videoUrl ?? "";
  const embedUrl = videoUrl && !isDirectVideoFile(videoUrl) ? toEmbeddableVideoUrl(videoUrl) : "";
  const durationText = formatDuration(lesson.duration);

  return (
    <div className="lms-page">
      <div className="flex flex-wrap justify-between gap-3">
        <div className="grid gap-2">
          <h2 className="text-2xl font-extrabold tracking-tight">{lesson.title ?? "Lesson"}</h2>
          <div className="flex flex-wrap gap-2">
            {lesson.order != null && <MetaPill>Lesson {lesson.order}</MetaPill>}
            {durationText && <MetaPill>Duration: {durationText}</MetaPill>}
          </div>
          <div className="text-xs text-muted-foreground">
            <Link to={`/courses/${courseId}`} className="font-bold text-primary no-underline hover:underline">
              ← Back to course
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

      <div className="grid gap-3 rounded-3xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
        <div className="text-sm font-extrabold tracking-wide">Lesson Media</div>

        {videoUrl ? (
          <div className="aspect-video overflow-hidden rounded-2xl border border-slate-700 bg-black">
            {isDirectVideoFile(videoUrl) ? (
              <video controls preload="metadata" className="h-full w-full object-cover" src={videoUrl} />
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                title={lesson.title ?? "Lesson video"}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="grid h-full place-items-center p-4 text-center text-sm font-bold text-white">
                Video URL is not embeddable in the player.
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">No video URL provided.</div>
        )}
      </div>

      <div className="grid gap-2 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="text-sm font-extrabold tracking-wide">Lesson Details</div>
        <div className="text-xs text-muted-foreground">
          {lesson.order != null ? `Order: ${lesson.order}` : "Order: N/A"}
        </div>
        <div className="text-xs text-muted-foreground">
          {durationText ? `Duration: ${durationText}` : "Duration: N/A"}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isStudent && (
          <Button onClick={markComplete} loading={completing} className="rounded-xl">
            Mark complete
          </Button>
        )}

        {nav.next && (
          <button
            onClick={() => navigate(`/courses/${courseId}/lessons/${nav.next.id}`)}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Go to next
          </button>
        )}
      </div>
    </div>
  );
}
