import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[46vh] place-items-center">
      <div className="w-full max-w-xl rounded-3xl border border-border/70 bg-card p-8 text-center shadow-sm">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Error</div>
        <h2 className="mt-3 text-5xl font-extrabold tracking-tight">404</h2>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
        <Link
          to="/courses"
          className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground no-underline transition-opacity hover:opacity-90"
        >
          Go to Courses
        </Link>
      </div>
    </div>
  );
}
