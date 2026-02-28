import { Link, NavLink as RouterNavLink, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { toastShow } from "@/components/ui/toast-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function AppNavLink({ to, children }) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground shadow"
            : "border border-border/70 bg-background/75 text-foreground hover:bg-accent hover:text-accent-foreground"
        }`
      }
    >
      {children}
    </RouterNavLink>
  );
}

export default function MainLayout() {
  const { isAuthed, user, logout } = useAuth();
  const role = user?.role;
  const isStudent = role === "student";
  const isInstructor = role === "instructor";

  return (
    <div className="lms-page">
      <header className="lms-surface flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/courses" className="inline-flex items-center gap-2 no-underline">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-sm font-black text-primary-foreground">
              LMS
            </span>
            <div>
              <div className="text-base font-extrabold leading-none">Learning Hub</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {isAuthed ? "Dashboard" : "Public catalog"}
              </div>
            </div>
          </Link>
          {isAuthed && role && (
            <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wide">
              {role}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-border/70 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            {isAuthed ? `Signed in${user?.email ? ` as ${user.email}` : ""}` : "Guest session"}
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          <AppNavLink to="/courses">Courses</AppNavLink>

          {isAuthed && isStudent && <AppNavLink to="/my-courses">My Enrolled</AppNavLink>}
          {isAuthed && isInstructor && (
            <AppNavLink to="/instructor/courses">Instructor</AppNavLink>
          )}

          {!isAuthed ? (
            <>
              <AppNavLink to="/login">Login</AppNavLink>
              <AppNavLink to="/register">Register</AppNavLink>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                logout();
                toastShow("Logged out", "success");
              }}
            >
              Logout
            </Button>
          )}
        </nav>
      </header>

      <main className="lms-surface p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}

