import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export function Private({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-loading" role="status" aria-label="Loading"><span className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

export const LegacyBooking = () => <Navigate to={`/booking/${useParams().id}`} replace />;
