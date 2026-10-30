import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Logo from './Logo';
import Icon from './Icon';

/** Dashboard layout (sidebar + content). `admin` pages show a notice to non-admins. */
export default function Shell({ title, admin = false, actions, children }) {
  const { isAdmin, logout } = useAuth();
  const link = ({ isActive }) => (isActive ? 'active' : undefined);
  return (
    <div className="container shell">
      <aside className="side">
        <Link to="/" className="brand side-brand"><Logo size={30} /> <span>visit<b>Nature</b></span></Link>
        <nav aria-label="Dashboard">
          <NavLink to="/my-bookings" className={link}><Icon name="suitcase" size={18} /> My bookings</NavLink>
          {isAdmin && <>
            <NavLink to="/manage-bookings" className={link}><Icon name="calcheck" size={18} /> Manage bookings</NavLink>
            <NavLink to="/add-service" className={link}><Icon name="plus" size={18} /> Add service</NavLink>
            <NavLink to="/dashboard" className={link}><Icon name="grid" size={18} /> Manage services</NavLink>
          </>}
          <NavLink to="/" end className="muted-link"><Icon name="home" size={18} /> Back to home</NavLink>
          <button onClick={logout}><Icon name="logout" size={18} /> Log out</button>
        </nav>
      </aside>
      <section className="panel">
        <div className="panel-head"><h1>{title}</h1>{actions}</div>
        {admin && !isAdmin ? (
          <div className="notice">
            <strong>Admin access needed.</strong> Add your Google email to <code>VITE_ADMIN_EMAILS</code> in <code>.env</code> and to
            <code> firestore.rules</code>, then restart the dev server.
          </div>
        ) : children}
      </section>
    </div>
  );
}
