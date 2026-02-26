import { Link } from "react-router-dom";
import ProgressBar from "../../shared/ui/ProgressBar";

export default function EnrolledCourseCard({ enrollment }) {
  // Normalize shapes:
  // enrollment.course could be object or course fields could be top-level
  const course = enrollment.course ?? enrollment;
  const progress = enrollment.progress ?? enrollment.progress_percent ?? 0;
  const courseId = course.id;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 14,
        display: "grid",
        gap: 10,
        background: "white",
      }}
    >
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 16, fontWeight: 1000, lineHeight: 1.2 }}>
          {course.title ?? "Untitled course"}
        </div>

        {course.description && (
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            {course.description.length > 120
              ? course.description.slice(0, 120) + "…"
              : course.description}
          </div>
        )}
      </div>

      <ProgressBar value={progress} />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link
          to={`/courses/${courseId}`}
          style={{
            textDecoration: "none",
            fontWeight: 900,
            fontSize: 13,
            color: "#111827",
            background: "white",
            padding: "10px 12px",
            borderRadius: 12,
            textAlign: "center",
            border: "1px solid #e5e7eb",
          }}
        >
          View course
        </Link>
      </div>
    </div>
  );
}