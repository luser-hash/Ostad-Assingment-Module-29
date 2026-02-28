import { useEffect, useMemo, useState } from "react";
import Spinner from "@/components/ui/spinner";
import { toastShow } from "@/components/ui/toast-store";
import LessonForm from "./LessonForm";
import {
  createLessonApi,
  listLessonsApi,
  updateLessonApi,
} from "./instructorLessonApi";

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    (error?.response?.data && typeof error.response.data === "object"
      ? Object.values(error.response.data).flat().join(" ")
      : null) ||
    fallback
  );
}

export default function ManageLessonsPanel({
  courseId,
  createRequestKey = 0,
  editRequest = null,
  onLessonCreated,
  onLessonUpdated,
}) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null); // lesson
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await listLessonsApi(courseId);
      const list = Array.isArray(data) ? data : data?.results ?? [];
      // sort by order if present
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setLessons(list);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load lessons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (!createRequestKey) return;
    setEditing(null);
    setCreating(true);
  }, [createRequestKey]);

  useEffect(() => {
    const lessonId = editRequest?.lessonId;
    if (!lessonId) return;

    const target = lessons.find((l) => String(l.id) === String(lessonId));
    if (!target) return;

    setCreating(false);
    setEditing(target);
  }, [editRequest, lessons]);

  const initialCreateValues = useMemo(() => ({
    title: "",
    content: "",
    video_url: "",
    order: (lessons.length ? (Math.max(...lessons.map(l => l.order ?? 0)) + 1) : 1),
    duration: 0,
  }), [lessons]);

  async function onCreate(values) {
    setBusyId("create");
    try {
      const created = await createLessonApi(courseId, values);
      setLessons((prev) => [...prev, created].sort((a,b)=> (a.order??0)-(b.order??0)));
      onLessonCreated?.(created);
      setCreating(false);
      toastShow("Lesson created.", "success");
    } catch (e) {
      const msg = getErrorMessage(e, "Create failed.");
      toastShow(msg, "error");
    } finally {
      setBusyId(null);
    }
  }

  async function onUpdate(values) {
    if (!editing?.id) return;
    setBusyId(editing.id);
    try {
      const updated = await updateLessonApi(courseId, editing.id, values);
      setLessons((prev) =>
        prev.map((l) => (l.id === editing.id ? updated : l)).sort((a,b)=> (a.order??0)-(b.order??0))
      );
      onLessonUpdated?.(updated);
      setEditing(null);
      toastShow("Lesson updated.", "success");
    } catch (e) {
      const msg = getErrorMessage(e, "Update failed.");
      toastShow(msg, "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div
      id="manage-lessons-panel"
      className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          Lesson Editor
        </h4>
        {!loading && lessons.length > 0 && (
          <span className="text-xs font-semibold text-muted-foreground">{lessons.length} lessons loaded</span>
        )}
      </div>

      {loading && <Spinner label="Loading lesson editor..." />}
      {!loading && err && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
          {err}
        </div>
      )}

      {creating && (
        <LessonForm
          initialValues={initialCreateValues}
          submitLabel="Create lesson"
          loading={busyId === "create"}
          onSubmit={onCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {editing && (
        <LessonForm
          initialValues={{
            title: editing.title ?? "",
            video_url: editing.video_url ?? "",
            order: editing.order ?? 1,
            duration: editing.duration ?? 0,
          }}
          submitLabel="Update lesson"
          loading={busyId === editing.id}
          onSubmit={onUpdate}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

