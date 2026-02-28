import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "@/components/ui/spinner";
import { useAuth } from "../providers/AuthProvider";

// wrap protected routes
export default function ProtectedRoute() {
    const { booting, isAuthed} = useAuth();
    const location = useLocation(); // get current route

    // if still booting show spinner
    if (booting) return <Spinner label="Checking session..."/>;

    // user trying to enter protected route,
    // if not autheticated redirect to login
    if (!isAuthed) {
        return <Navigate to="/login" replace state={{ from: location.pathname }}/>
    }

    return <Outlet />
}
