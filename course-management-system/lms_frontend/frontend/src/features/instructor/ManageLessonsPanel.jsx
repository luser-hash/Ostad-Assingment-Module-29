import { useEffect, useMemo, useState } from "react";
import Panel from "../../shared/ui/Panel";
import Spinner from "../../shared/ui/Spinner";
import LessonForm from "./LessonForm";
import {
  createLessonApi,
  deleteLessonApi,
  listLessonsApi,
  updateLessonApi,
} from "./instructorLessonApi";

export default function ManageLessonsPanel({ courseId }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null); // lesson
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    setErr("");
    setMsg("");
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

  const initialCreateValues = useMemo(() => ({
    title: "",
    content: "",
    video_url: "",
    order: (lessons.length ? (Math.max(...lessons.map(l => l.order ?? 0)) + 1) : 1),
    duration: 0,
  }), [lessons]);

  async function onCreate(values) {
    setMsg("");
    setBusyId("create");
    try {
      const created = await createLessonApi(courseId, values);
      setLessons((prev) => [...prev, created].sort((a,b)=> (a.order??0)-(b.order??0)));
      setCreating(false);
      setMsg("Lesson created.");
    } catch (e) {
      setMsg(e?.response?.data?.detail || "Create failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function onUpdate(values) {
    if (!editing?.id) return;
    setMsg("");
    setBusyId(editing.id);
    try {
      const updated = await updateLessonApi(courseId, editing.id, values);
      setLessons((prev) =>
        prev.map((l) => (l.id === editing.id ? updated : l)).sort((a,b)=> (a.order??0)-(b.order??0))
      );
      setEditing(null);
      setMsg("Lesson updated.");
    } catch (e) {
      setMsg(e?.response?.data?.detail || "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(lesson) {
    const ok = confirm(`Delete lesson "${lesson.title ?? "Untitled"}"?`);
    if (!ok) return;

    setMsg("");
    setBusyId(lesson.id);
    try {
      await deleteLessonApi(courseId, lesson.id);
      setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
      setMsg("Lesson deleted.");
      if (editing?.id === lesson.id) setEditing(null);
    } catch (e) {
      setMsg(e?.response?.data?.detail || "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Panel
      title="Manage lessons (Instructor)"
      right={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => load()}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => { setEditing(null); setCreating(v => !v); }}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #111827",
              background: "#111827",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {creating ? "Close" : "New lesson"}
          </button>
        </div>
      }
    >
      {msg && (
        <div style={{ fontWeight: 900, opacity: 0.85 }}>{msg}</div>
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

      {loading && <Spinner label="Loading lessons..." />}
      {!loading && err && (
        <div style={{ color: "#991b1b", fontWeight: 900 }}>{err}</div>
      )}

      {!loading && !err && lessons.length === 0 && (
        <div style={{ opacity: 0.75, fontWeight: 900 }}>No lessons yet.</div>
      )}

      {!loading && !err && lessons.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          {lessons.map((l) => (
            <div
              key={l.id}
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
                  {l.order ? `${l.order}. ` : ""}{l.title ?? "Untitled"}
                </div>
                {(l.duration != null) && (
                  <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 800 }}>
                    Duration: {l.duration}s
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  disabled={busyId === l.id}
                  onClick={() => { setCreating(false); setEditing(l); }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>

                <button
                  disabled={busyId === l.id}
                  onClick={() => onDelete(l)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #991b1b",
                    background: "white",
                    color: "#991b1b",
                    fontWeight: 1000,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}