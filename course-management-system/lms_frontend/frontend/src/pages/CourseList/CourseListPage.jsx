import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Spinner from "@/components/ui/spinner";
import Input from "@/components/ui/input-field";
import CourseCard from "../../entities/course/CourseCard";
import { listCoursesByPageApi } from "../../entities/course/courseApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

export default function CourseListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageCount, setPageCount] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  async function load(page = 1) {
    setError("");
    setLoading(true);
    try {
      const data = await listCoursesByPageApi(page);

      const items = Array.isArray(data) ? data : data?.results ?? [];
      setCourses(items);
      setHasNextPage(Boolean(data?.next));
      setHasPreviousPage(Boolean(data?.previous));

      if (typeof data?.count === "number") {
        setPageCount(Math.max(1, Math.ceil(data.count / PAGE_SIZE)));
      } else {
        setPageCount(1);
      }
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to load courses.";
      setError(msg);
      setCourses([]);
      setPageCount(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(currentPage);
  }, [currentPage]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return courses;

    return courses.filter((c) => {
      const title = (c.title ?? "").toLowerCase();
      const desc = (c.description ?? "").toLowerCase();
      return title.includes(query) || desc.includes(query);
    });
  }, [courses, q]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(pageCount, currentPage + 2);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, pageCount]);

  function changePage(page) {
    const nextPage = Math.min(Math.max(1, page), pageCount);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextPage <= 1) {
        next.delete("page");
      } else {
        next.set("page", String(nextPage));
      }
      return next;
    });
  }

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
          <Button variant="outline" onClick={() => load(currentPage)}>
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
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {pageCount > 1 && (
            <nav
              aria-label="Course pages"
              className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border/70 bg-card/70 p-3"
            >
              <Button
                variant="outline"
                onClick={() => changePage(currentPage - 1)}
                disabled={!hasPreviousPage}
              >
                Previous
              </Button>

              {pageNumbers[0] > 1 && (
                <Button variant="outline" onClick={() => changePage(1)}>
                  1
                </Button>
              )}

              {pageNumbers[0] > 2 && (
                <span className="px-2 text-sm font-semibold text-muted-foreground">...</span>
              )}

              {pageNumbers.map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => changePage(page)}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </Button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < pageCount - 1 && (
                <span className="px-2 text-sm font-semibold text-muted-foreground">...</span>
              )}

              {pageNumbers[pageNumbers.length - 1] < pageCount && (
                <Button variant="outline" onClick={() => changePage(pageCount)}>
                  {pageCount}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => changePage(currentPage + 1)}
                disabled={!hasNextPage}
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

