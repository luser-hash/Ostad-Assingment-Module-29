import { useEffect, useMemo, useState } from "react";
import Spinner from "@/components/ui/spinner";
import Input from "@/components/ui/input-field";
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
    <div className="lms-page">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <h2 className="text-2xl font-extrabold tracking-tight">My Enrolled Courses</h2>
          <div className="mt-1 text-sm text-muted-foreground">
            Continue learning where you left off.
          </div>
        </div>

        <div className="w-full max-w-[420px] flex-1">
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
          You have no enrolled courses yet.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
          {filtered.map((enr, idx) => (
            <EnrolledCourseCard key={enr.id ?? idx} enrollment={enr} />
          ))}
        </div>
      )}
    </div>
  );
}

