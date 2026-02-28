import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Spinner from "@/components/ui/spinner";
import Input from "@/components/ui/input-field";
import Panel from "@/components/ui/panel";
import Button from "@/components/ui/button-loading";
import { toastShow } from "@/components/ui/toast-store";

import CourseForm from "../../features/instructor/CourseForm";
import {
  createCourseApi,
  deleteCourseApi,
  listMyInstructorCoursesApi,
  updateCourseApi,
} from "../../features/instructor/instructorCourseApi";

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

function CourseRow({ course, onEdit, onDelete, busy }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="grid min-w-[220px] flex-1 gap-1">
        <div className="text-base font-extrabold">{course.title ?? "Untitled course"}</div>
        {course.description && (
          <div className="line-clamp-2 text-xs text-muted-foreground">
            {course.description.length > 120 ? course.description.slice(0, 120) + "..." : course.description}
          </div>
        )}
        <div className="mt-1 flex flex-wrap gap-3">
          {course?.id ? (
            <Link to={`/courses/${course.id}`} className="text-xs font-bold text-primary no-underline hover:underline">
              View public page
            </Link>
          ) : (
            <span className="text-xs font-bold text-muted-foreground">Unavailable</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onEdit(course)}
          disabled={busy}
          className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(course)}
          disabled={busy}
          className="rounded-xl border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-extrabold text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
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
  const [editing, setEditing] = useState(null);

  const [busyId, setBusyId] = useState(null);

  async function load() {
    setError("");
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
    setBusyId("create");
    try {
      const created = await createCourseApi(values);
      setItems((prev) => [created, ...prev]);
      setShowCreate(false);
      toastShow("Course created.", "success");
    } catch (e) {
      const msg = getErrorMessage(e, "Failed to create course.");
      toastShow(msg, "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleUpdate(values) {
    if (!editing?.id) return;
    setBusyId(editing.id);
    try {
      const updated = await updateCourseApi(editing.id, values);
      setItems((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      setEditing(null);
      toastShow("Course updated.", "success");
    } catch (e) {
      const msg = getErrorMessage(e, "Failed to update course.");
      toastShow(msg, "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(course) {
    if (!course?.id) return;
    const ok = confirm(`Delete course "${course.title ?? "Untitled"}"?`);
    if (!ok) return;

    setBusyId(course.id);
    try {
      await deleteCourseApi(course.id);
      setItems((prev) => prev.filter((c) => c.id !== course.id));
      toastShow("Course deleted.", "success");
      if (editing?.id === course.id) setEditing(null);
    } catch (e) {
      const msg = getErrorMessage(e, "Failed to delete course.");
      toastShow(msg, "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="lms-page">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <h2 className="text-2xl font-extrabold tracking-tight">Instructor Studio</h2>
          <div className="mt-1 text-sm text-muted-foreground">
            Build and manage your courses from one place.
          </div>
        </div>

        <div className="w-full max-w-[420px] flex-1">
          <Input
            label="Search"
            placeholder="Search your courses..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setEditing(null);
              setShowCreate((v) => !v);
            }}
            loading={busyId === "create"}
            className="rounded-xl"
          >
            {showCreate ? "Close" : "New course"}
          </Button>
          <button
            onClick={load}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Refresh
          </button>
        </div>
      </div>

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
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-destructive">
          <div>{error}</div>
          <button
            onClick={load}
            className="rounded-lg border border-destructive bg-background px-3 py-2 text-xs font-bold transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm font-bold text-muted-foreground">
          No courses yet. Create your first course.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-3">
          {filtered.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              busy={busyId === course.id}
              onEdit={(c) => {
                setShowCreate(false);
                setEditing(c);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
