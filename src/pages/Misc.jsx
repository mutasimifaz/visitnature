import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useSeo } from '../lib';

export function OrderPlaced() {
  const { user } = useAuth();
  useSeo({ title: 'Booking received', path: '/order-placed', noindex: true });
  return (
    <main className="section"><div className="container empty">
      <h1>Thank you, {user?.displayName?.split(' ')[0] || 'traveller'}.</h1>
      <p>Your booking is received and marked <strong>Pending</strong>. We’ll confirm it by email.</p>
      <Link to="/my-bookings" className="btn btn-sun">See your bookings</Link>
    </div></main>
  );
}

export function NotFound() {
  useSeo({ title: 'Page not found', path: '/404', noindex: true });
  return (
    <main className="section"><div className="container empty">
      <img src="/img/404.webp" alt="" width="400" height="267" />
      <h1>This trail doesn’t exist</h1>
      <p>The page you’re looking for was moved or never existed.</p>
      <Link to="/" className="btn btn-ink">Back to home</Link>
    </div></main>
  );
}
