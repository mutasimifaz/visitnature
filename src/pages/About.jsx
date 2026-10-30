import { Link } from 'react-router-dom';
import { useSeo } from '../lib';
import Icon from '../components/Icon';

const FEATURES = [
  { icon: 'wallet', title: 'Affordable prices', text: 'Premium travel without the premium markup. We keep packages honest.' },
  { icon: 'compass', title: 'Best destinations', text: 'Spots we have visited ourselves, chosen for views and authentic experiences.' },
  { icon: 'headset', title: 'Personal service', text: 'A real person answers, and a guide stays with you for the whole trip.' },
  { icon: 'shield', title: 'Safe travelling', text: 'Vetted transport, briefed guides and clear plans for every route.' },
];

export default function About() {
  useSeo({ title: 'About us', description: 'visitNature is a Feni-based travel team that plans affordable, safe, guided nature trips across Bangladesh and abroad.', path: '/about' });
  return (
    <main className="section">
      <div className="container about">
        <div className="section-head">
          <h1>We are visitNature, the team that handles every detail.</h1>
          <p>Travel is more than visiting places. It is the memories that last. Our staff is dedicated to your comfort at every step, from customer care to on-ground support.</p>
        </div>
        <div className="features">
          {FEATURES.map((f) => (
            <div className="feature" key={f.title}>
              <Icon name={f.icon} size={28} />
              <h2 className="h3">{f.title}</h2>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
        <div className="video">
          <iframe src="https://www.youtube-nocookie.com/embed/P5JnMJfa0HA" title="visitNature travel video" loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
        <p className="center"><Link to="/#packages" className="btn btn-sun">See our packages</Link></p>
      </div>
    </main>
  );
}
