import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Logo from './Logo';
import Icon from './Icon';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [nav, setNav] = useState(false);
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();
  const box = useRef(null);

  useEffect(() => { setNav(false); setMenu(false); }, [pathname]);
  useEffect(() => {
    const away = (e) => { if (box.current && !box.current.contains(e.target)) setMenu(false); };
    const esc = (e) => e.key === 'Escape' && (setMenu(false), setNav(false));
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, []);

  const cls = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <header className="site-header">
      <div className="container bar">
        <Link to="/" className="brand" aria-label="visitNature home">
          <Logo size={34} />
        </Link>

        <button className="icon-btn nav-toggle" aria-label="Menu" aria-expanded={nav} onClick={() => setNav(!nav)}>
          <Icon name={nav ? 'close' : 'menu'} />
        </button>

        <nav className={`nav ${nav ? 'open' : ''}`} aria-label="Main">
          <NavLink to="/" end className={cls}>Home</NavLink>
          <NavLink to="/blog" className={cls}>Blog</NavLink>
          <NavLink to="/about" className={cls}>About us</NavLink>
          {isAdmin && <NavLink to="/dashboard" className={cls}>Dashboard</NavLink>}

          <div className="account" ref={box}>
            {user ? (
              <>
                <button className="avatar-btn" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Account menu">
                  {user.photoURL
                    ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" width="36" height="36" />
                    : <span>{(user.displayName || user.email)[0].toUpperCase()}</span>}
                </button>
                {menu && (
                  <div className="menu">
                    <p className="menu-name">{user.displayName || 'Traveller'}<small>{user.email}</small></p>
                    <Link to="/my-bookings"><Icon name="suitcase" size={18} /> My bookings</Link>
                    {isAdmin && <>
                      <Link to="/manage-bookings"><Icon name="calcheck" size={18} /> Manage bookings</Link>
                      <Link to="/add-service"><Icon name="plus" size={18} /> Add service</Link>
                      <Link to="/dashboard"><Icon name="grid" size={18} /> All services</Link>
                    </>}
                    <button onClick={logout}><Icon name="logout" size={18} /> Log out</button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="btn btn-sun btn-sm">Log in</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
