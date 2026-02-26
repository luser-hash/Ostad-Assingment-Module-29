import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Spinner from "../../shared/ui/Spinner";
import Input from "../../shared/ui/Input";
import Panel from "../../shared/ui/Panel";
import Button from "../../shared/ui/Button";

import CourseForm from "../../features/instructor/CourseForm";
import {
  createCourseApi,
  deleteCourseApi,
  listMyInstructorCoursesApi,
  updateCourseApi,
} from "../../features/instructor/instructorCourseApi";

function CourseRow({ course, onEdit, onDelete, busy }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 12,
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
        background: "white",
      }}
    >
      <div style={{ display: "grid", gap: 4, minWidth: 220 }}>
        <div style={{ fontWeight: 1000 }}>{course.title ?? "Untitled course"}</div>
        {course.description && (
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            {course.description.length > 120 ? course.description.slice(0, 120) + "…" : course.description}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to={`/courses/${course.id}`} style={{ fontSize: 13, fontWeight: 900 }}>
            View
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => onEdit(course)}
          disabled={busy}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "white",
            fontWeight: 900,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(course)}
          disabled={busy}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #991b1b",
            background: "white",
            color: "#991b1b",
            fontWeight: 1000,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function InstructorCoursesPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null); // course object or null

  const [busyId, setBusyId] = useState(null);
  const [serverMsg, setServerMsg] = useState("");

  async function load() {
    setError("");
    setServerMsg("");
    setLoading(true);
    try {
      const data = await listMyInstructorCoursesApi();
      const list = Array.isArray(data) ? data : data?.results ?? [];
      setItems(list);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to load instructor courses.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((c) => {
      const title = (c.title ?? "").toLowerCase();
      const desc = (c.description ?? "").toLowerCase();
      return title.includes(query) || desc.includes(query);
    });
  }, [items, q]);

  async function handleCreate(values) {
    setServerMsg("");
    setBusyId("create");
    try {
      const created = await createCourseApi(values);
      setItems((prev) => [created, ...prev]);
      setShowCreate(false);
      setServerMsg("Course created.");
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (e?.response?.data && typeof e.response.data === "object"
          ? Object.values(e.response.data).flat().join(" ")
          : null) ||
        "Failed to create course.";
      setServerMsg(msg);
    } finally {
      setBusyId(null);
    }
  }

  async function handleUpdate(values) {
    if (!editing?.id) return;
    setServerMsg("");
    setBusyId(editing.id);
    try {
      const updated = await updateCourseApi(editing.id, values);
      setItems((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      setEditing(null);
      setServerMsg("Course updated.");
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (e?.response?.data && typeof e.response.data === "object"
          ? Object.values(e.response.data).flat().join(" ")
          : null) ||
        "Failed to update course.";
      setServerMsg(msg);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(course) {
    if (!course?.id) return;
    const ok = confirm(`Delete course "${course.title ?? "Untitled"}"?`);
    if (!ok) return;

    setServerMsg("");
    setBusyId(course.id);
    try {
      await deleteCourseApi(course.id);
      setItems((prev) => prev.filter((c) => c.id !== course.id));
      setServerMsg("Course deleted.");
      if (editing?.id === course.id) setEditing(null);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to delete course.";
      setServerMsg(msg);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <div style={{ flex: "1 1 320px" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 1000 }}>Instructor</h2>
          <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
            Manage your courses (create, edit, delete).
          </div>
        </div>

        <div style={{ flex: "1 1 320px", maxWidth: 420 }}>
          <Input
            label="Search"
            placeholder="Search your courses..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button onClick={() => { setEditing(null); setShowCreate((v) => !v); }} loading={busyId === "create"}>
            {showCreate ? "Close" : "New course"}
          </Button>
          <button
            onClick={load}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {serverMsg && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            background: "#f8fafc",
            padding: 12,
            borderRadius: 14,
            fontWeight: 900,
          }}
        >
          {serverMsg}
        </div>
      )}

      {showCreate && (
        <Panel title="Create course">
          <CourseForm
            submitLabel="Create"
            loading={busyId === "create"}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Panel>
      )}

      {editing && (
        <Panel title={`Edit course: ${editing.title ?? "Untitled"}`}>
          <CourseForm
            initialValues={{ title: editing.title ?? "", description: editing.description ?? "" }}
            submitLabel="Update"
            loading={busyId === editing.id}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </Panel>
      )}

      {loading && <Spinner label="Loading instructor courses..." />}

      {!loading && error && (
        <div
          style={{
            border: "1px solid #fecaca",
            background: "#fff1f2",
            color: "#991b1b",
            padding: 12,
            borderRadius: 14,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            fontWeight: 900,
          }}
        >
          <div>{error}</div>
          <button
            onClick={load}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #991b1b",
              background: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div
          style={{
            border: "1px dashed #d1d5db",
            padding: 18,
            borderRadius: 16,
            textAlign: "center",
            opacity: 0.8,
            fontWeight: 900,
          }}
        >
          No courses yet. Create your first course.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              busy={busyId === course.id}
              onEdit={(c) => { setShowCreate(false); setEditing(c); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}