import { Navigate, Outlet } from "react-router-dom";
import Spinner from "@/components/ui/spinner";
import { useAuth } from "../providers/AuthProvider";

/**
 * Usage: <RoleGuard allow={["instructor"]} />
 * object has user.role = "student" | "instructor"
 */
export default function RoleGuard({ allow = [] }) {
  const { booting, user } = useAuth();

  if (booting) return <Spinner label="Checking permissions..." />;

  // Read user.role
  const role = user?.role;
  // Check whether the role is in the allow array
  const ok = role && allow.includes(role);

  // If not allowed, redirect to /courses.
  if (!ok) return <Navigate to="/courses" replace />;

  // If allowed, render <Outlet />.
  return <Outlet />;
}
