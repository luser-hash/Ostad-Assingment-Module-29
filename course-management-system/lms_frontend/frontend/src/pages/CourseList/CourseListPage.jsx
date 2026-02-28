import { useEffect, useMemo, useState } from "react";
import Spinner from "@/components/ui/spinner";
import Input from "@/components/ui/input-field";
import CourseCard from "../../entities/course/CourseCard";
import { listCoursesApi } from "../../entities/course/courseApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
    <div className="lms-page">
      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-cyan-50 to-amber-50 p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Catalog</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Discover your next course</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse available courses and start building practical skills.
            </p>
          </div>

          <div className="w-full max-w-[420px] flex-1">
            <Input
              label="Search"
              placeholder="Search by title or description..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </section>

      {loading && <Spinner label="Loading courses..." />}

      {!loading && error && (
        <Alert variant="destructive" className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <AlertTitle>Failed to load courses</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </div>
          <Button variant="outline" onClick={load}>
            Retry
          </Button>
        </Alert>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed p-5 text-center text-sm font-semibold text-muted-foreground">
          No courses found{q.trim() ? " for your search." : "."}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

