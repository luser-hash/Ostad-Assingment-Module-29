import { useEffect, useMemo, useState } from "react";
import Spinner from "../../shared/ui/Spinner";
import Input from "../../shared/ui/Input";
import EnrolledCourseCard from "../../features/enroll/EnrolledCourseCard";
import {
  getCourseProgressApi,
  listMyEnrollmentsApi,
} from "../../features/enroll/enrollmentApi";

export default function MyEnrolledCoursesPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await listMyEnrollmentsApi();
      const list = Array.isArray(data) ? data : data?.results ?? [];
      const withProgress = await Promise.all(
        list.map(async (item) => {
          const course = item?.course ?? item;
          const courseId = course?.id ?? item?.course_id;

          if (!courseId) {
            return {
              ...item,
              progress: item?.progress ?? item?.progress_percent ?? 0,
            };
          }

          try {
            const progressData = await getCourseProgressApi(courseId);
            const percent = progressData?.progress_percent ?? 0;

            return {
              ...item,
              progress: percent,
              progress_percent: percent,
              progressDetails: progressData,
            };
          } catch {
            return {
              ...item,
              progress: item?.progress ?? item?.progress_percent ?? 0,
            };
          }
        })
      );

      setItems(withProgress);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to load your enrolled courses.";
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

    return items.filter((enr) => {
      const course = enr.course ?? enr;
      const title = (course.title ?? "").toLowerCase();
      const desc = (course.description ?? "").toLowerCase();
      return title.includes(query) || desc.includes(query);
    });
  }, [items, q]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <div style={{ flex: "1 1 320px" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 1000 }}>My Enrolled Courses</h2>
          <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
            Continue learning where you left off.
          </div>
        </div>

        <div style={{ flex: "1 1 320px", maxWidth: 420 }}>
          <Input
            label="Search"
            placeholder="Search enrolled courses..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {loading && <Spinner label="Loading your courses..." />}

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
          You have no enrolled courses yet.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {filtered.map((enr, idx) => (
            <EnrolledCourseCard key={enr.id ?? idx} enrollment={enr} />
          ))}
        </div>
      )}
    </div>
  );
}
