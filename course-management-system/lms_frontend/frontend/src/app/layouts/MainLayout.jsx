import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { toastShow } from "../../shared/ui/toastStore";

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        color: "#111827",
        fontWeight: 700,
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Link>
  );
}

export default function MainLayout() {
  const { isAuthed, user, logout } = useAuth();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link to="/courses" style={{ textDecoration: "none", color: "#111827" }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>LMS</div>
          </Link>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {isAuthed ? `Signed in${user?.email ? `: ${user.email}` : ""}` : "Guest"}
          </div>
        </div>

        <nav style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <NavLink to="/courses">Courses</NavLink>

          {isAuthed && <NavLink to="/my-courses">My Enrolled</NavLink>}
          {isAuthed && user?.role === "instructor" && (
            <NavLink to="/instructor/courses">Instructor</NavLink>
          )}

          {!isAuthed ? (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          ) : (
            <button
              onClick={ () => {
                logout();
                toastShow("Logged out", "success");
              }}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #111827",
                background: "white",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}