import { Navigate, useLocation } from "react-router-dom";
import { useProvider } from "../context/Provider";
import Loader from "./Loader";

/**
 * ProtectedRoutes will check if user is authenticated.
 * - If authenticated, allows navigation to the requested page.
 * - If not, redirects to login (with redirect-back).
 */
export default function ProtectedRoutes() {
    const { user, globalLoading } = useProvider();
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (globalLoading) {
        return <Loader />;
    }

    // User is authenticated, allow access to the requested route
    if (user || token) {
        // Allow rendering of children/protected outlet; 
        // This should be wrapped by <Outlet /> in the parent route config.
        return null;
    }

    // If not authenticated, redirect to login page, preserving the destination
    return (
        <Navigate
            to={`/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
            replace
        />
    );
}