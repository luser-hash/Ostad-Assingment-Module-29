import { useEffect, useMemo, useState } from "react";
import Spinner from "../../shared/ui/Spinner";
import Input from "../../shared/ui/Input";
import CourseCard from "../../entities/course/CourseCard";
import { listCoursesApi } from "../../entities/course/courseApi";

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await listCoursesApi();

      // DRF sometimes paginates: { results: [...] }
      const items = Array.isArray(data) ? data : data?.results ?? [];
      setCourses(items);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to load courses.";
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
    if (!query) return courses;

    return courses.filter((c) => {
      const title = (c.title ?? "").toLowerCase();
      const desc = (c.description ?? "").toLowerCase();
      return title.includes(query) || desc.includes(query);
    });
  }, [courses, q]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <div style={{ flex: "1 1 320px" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Courses</h2>
          <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
            Browse available courses and view details.
          </div>
        </div>

        <div style={{ flex: "1 1 320px", maxWidth: 420 }}>
          <Input
            label="Search"
            placeholder="Search by title or description..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {loading && <Spinner label="Loading courses..." />}

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
            fontWeight: 800,
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
            fontWeight: 700,
          }}
        >
          No courses found{q.trim() ? " for your search." : "."}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}