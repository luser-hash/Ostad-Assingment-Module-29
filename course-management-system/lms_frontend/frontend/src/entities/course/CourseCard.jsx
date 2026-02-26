import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
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
        <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.2 }}>
          {course.title ?? "Untitled course"}
        </div>

        {course.description && (
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            {course.description.length > 140
              ? course.description.slice(0, 140) + "…"
              : course.description}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {course.instructor_name && (
          <span
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              opacity: 0.85,
              fontWeight: 700,
            }}
          >
            {course.instructor_name}
          </span>
        )}

        {typeof course.lessons_count === "number" && (
          <span
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              opacity: 0.85,
              fontWeight: 700,
            }}
          >
            {course.lessons_count} lessons
          </span>
        )}
      </div>

      <Link
        to={`/courses/${course.id}`}
        style={{
          textDecoration: "none",
          fontWeight: 900,
          fontSize: 13,
          color: "white",
          background: "#111827",
          padding: "10px 12px",
          borderRadius: 12,
          textAlign: "center",
        }}
      >
        View details
      </Link>
    </div>
  );
}