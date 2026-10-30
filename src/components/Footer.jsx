import { Link } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container foot-grid">
        <div>
          <Link to="/" className="brand light"><Logo size={34} /> <span>visit<b>Nature</b></span></Link>
          <p className="foot-about">Guided nature trips across Bangladesh and beyond, planned with comfort and safety in mind.</p>
        </div>
        <div>
          <h2>Explore</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/login">Log in</Link></li>
          </ul>
        </div>
        <div>
          <h2>Contact</h2>
          <ul className="contact">
            <li><Icon name="pin" size={18} /> 21 Revolution Street, Feni, Bangladesh</li>
            <li><Icon name="phone" size={18} /> <a href="tel:+8801234567890">+880 1234 567890</a></li>
            <li><Icon name="mail" size={18} /> <a href="mailto:contact@visitnature.com">contact@visitnature.com</a></li>
          </ul>
        </div>
        <div>
          <h2>Follow</h2>
          <ul>
            <li><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noreferrer">X (Twitter)</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
            <li><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div className="container foot-base">© {new Date().getFullYear()} visitNature. All rights reserved.</div>
    </footer>
  );
}
