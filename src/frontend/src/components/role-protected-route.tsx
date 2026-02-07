import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleProtectedRouteProps {
    allowedRoles: string[];
}

export default function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[50vh]">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const hasRole = user.roles.some(role => allowedRoles.includes(role));

    if (!hasRole) {
        return <Navigate to="/" replace />; // Or an Unauthorized page
    }

    return <Outlet />;
}
