import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function getCourseThumbnailUrl(thumbnail) {
  if (!thumbnail || typeof thumbnail !== "string") return "";

  if (/^https?:\/\//i.test(thumbnail)) return thumbnail;

  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? "").trim();
  if (!apiBase) return thumbnail;

  try {
    return new URL(thumbnail, apiBase).toString();
  } catch {
    return thumbnail;
  }
}

export default function CourseCard({ course }) {
  const thumbnailUrl = getCourseThumbnailUrl(course?.thumbnail);
  const courseId = course?.id;

  return (
    <Card className="group overflow-hidden rounded-2xl border-border/70 bg-card/95 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-video border-b border-border/70 bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={course?.title ? `${course.title} thumbnail` : "Course thumbnail"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs font-semibold text-muted-foreground">
            No thumbnail
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/45 to-transparent" />
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-base leading-snug tracking-tight">
          {course.title ?? "Untitled course"}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-wrap items-center gap-2 pt-0">
        {course.instructor_name && (
          <Badge variant="secondary" className="font-semibold">
            {course.instructor_name}
          </Badge>
        )}
        {typeof course.lessons_count === "number" && (
          <Badge variant="outline" className="font-semibold">
            {course.lessons_count} lessons
          </Badge>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        {courseId ? (
          <Button asChild className="w-full rounded-xl">
            <Link to={`/courses/${courseId}`}>View details</Link>
          </Button>
        ) : (
          <Button className="w-full rounded-xl" disabled>
            View details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
