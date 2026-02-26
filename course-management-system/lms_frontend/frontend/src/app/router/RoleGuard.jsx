import { Navigate, Outlet } from "react-router-dom";
import Spinner from "../../shared/ui/Spinner";
import { useAuth } from "../providers/AuthProvider";

/**
 * Usage: <RoleGuard allow={["instructor"]} />
 * object has user.role = "student" | "instructor"
 */
export default function RoleGuard({ allow = [] }) {
  const { booting, user } = useAuth();

  if (booting) return <Spinner label="Checking permissions..." />;

  const role = user?.role;
  const ok = role && allow.includes(role);

  if (!ok) return <Navigate to="/courses" replace />;

  return <Outlet />;
}