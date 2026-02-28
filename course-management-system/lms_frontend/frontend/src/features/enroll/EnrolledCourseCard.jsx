import { Link } from "react-router-dom";
import ProgressBar from "@/components/ui/progress-bar";

export default function EnrolledCourseCard({ enrollment }) {
  // Normalize shapes:
  // enrollment.course could be object or course fields could be top-level
  const course = enrollment.course ?? enrollment;
  const progress = enrollment.progress ?? enrollment.progress_percent ?? 0;
  const courseId = course.id;

  return (
    <div className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid gap-1.5">
        <div className="line-clamp-2 text-base font-extrabold leading-tight">
          {course.title ?? "Untitled course"}
        </div>

        {course.description && (
          <div className="line-clamp-3 text-xs text-muted-foreground">
            {course.description.length > 120
              ? course.description.slice(0, 120) + "…"
              : course.description}
          </div>
        )}
      </div>

      <ProgressBar value={progress} />

      <div className="flex flex-wrap gap-2">
        {courseId ? (
          <Link
            to={`/courses/${courseId}`}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View course
          </Link>
        ) : (
          <div className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground">
            Course unavailable
          </div>
        )}
      </div>
    </div>
  );
}
