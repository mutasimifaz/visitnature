import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices, seedServices } from '../api';
import { useAsync, useSeo, money } from '../lib';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { gallery } from '../data/gallery';
import SmartImg from '../components/SmartImg';
import Icon from '../components/Icon';

const DESTINATIONS = [
  { name: 'Kuakata', detail: 'Bangladesh', image: '/img/kuakata.webp', tag: 'Beach escapes' },
  { name: 'Sajek Valley', detail: 'Bangladesh', image: gallery[0], tag: 'Mountain views' },
  { name: 'Meeru Island', detail: 'Maldives', image: '/img/meeru.webp', tag: 'Island stays' },
  { name: 'Bali', detail: 'Indonesia', image: '/img/bali.webp', tag: 'Culture & nature' },
];

function SearchIntro({ query, setQuery, services, loading }) {
  const matches = (services || []).filter((s) => `${s.name || ''} ${s.location || ''} ${s.description || ''}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6);
  return (
    <section className="market-hero">
      <div className="container market-hero-inner">
        <div className="market-copy">
          <span className="eyebrow"><span /> YOUR NEXT ESCAPE STARTS HERE</span>
          <h1>Find a place to <em>feel somewhere else.</em></h1>
          <p>Thoughtful trips, memorable places, and local experiences — all in one place.</p>
        </div>
        <div className="search-area">
          <div className="market-search" role="search">
            <label className="search-field"><Icon name="search" size={21} /><span><small>Where to?</small><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search destinations or packages" aria-label="Search destinations or packages" /></span></label>
            <a href="#packages" className="search-submit" aria-label="Explore packages"><Icon name="search" size={22} /></a>
          </div>
          {query.trim() && <div className="search-live-results" aria-live="polite">
            <div className="search-live-heading">{loading ? 'Finding experiences…' : `${matches.length} matching ${matches.length === 1 ? 'experience' : 'experiences'}`}</div>
            {!loading && matches.map((s) => <Link to={`/booking/${s.id}`} className="search-live-item" key={s.id}><SmartImg src={s.photoUrl || s.imageUrls?.[0]} alt="" width="100" height="76" /><span><strong>{s.name}</strong><small>{s.location || s.duration || 'Explore experience'}</small></span><b>From {money(s.price)}</b></Link>)}
            {!loading && !matches.length && <p className="search-live-empty">No matching experiences yet. Try another destination.</p>}
            <a className="search-live-all" href="#packages">See all search results <Icon name="arrow-right" size={15} /></a>
          </div>}
        </div>
        <div className="hero-trust"><span><Icon name="check" size={16} /> Handpicked destinations</span><span><Icon name="shield" size={16} /> Friendly local support</span><span><Icon name="heart" size={16} /> Trips worth remembering</span></div>
      </div>
      <div className="market-hero-photo" aria-hidden="true"><img src="/img/bali.webp" alt="" fetchPriority="high" decoding="async" /></div>
    </section>
  );
}

function DestinationRail() {
  return (
    <section className="destination-section">
      <div className="container">
        <div className="section-heading-row"><div><span className="eyebrow">GET INSPIRED</span><h2>Explore by destination</h2></div><a href="#packages" className="text-link">View all trips <Icon name="arrow-right" size={16} /></a></div>
        <div className="destination-rail">
          {DESTINATIONS.map((d) => <a className="destination-tile" href="#packages" key={d.name}>
            <img src={d.image} alt={d.name} loading="lazy" />
            <span className="destination-overlay"><small>{d.tag}</small><strong>{d.name}</strong><span>{d.detail}</span></span>
          </a>)}
        </div>
      </div>
    </section>
  );
}

function Packages({ search, data, loading, error, reload }) {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const { isAdmin } = useAuth();
  const toast = useToast();
  const filtered = useMemo(() => (data || []).filter((s) => { const textMatch = `${s.name || ''} ${s.description || ''} ${s.duration || ''} ${s.location || ''}`.toLowerCase().includes(search.toLowerCase()); const price = Number(s.price || 0); return textMatch && (minPrice === '' || price >= Number(minPrice)) && (maxPrice === '' || price <= Number(maxPrice)); }), [data, search, minPrice, maxPrice]);
  const seed = async () => {
    try { await seedServices(); toast('Starter packages added.'); reload(); }
    catch { toast('Could not add starter packages. Check your Firebase configuration and Firestore rules.', 'error'); }
  };
  return (
    <section className="section packages-section" id="packages">
      <div className="container">
        <div className="section-heading-row"><div><span className="eyebrow">MADE FOR YOUR NEXT STORY</span><h2>Popular getaways</h2><p>Little escapes and big adventures, picked for you.</p></div><span className="result-count">{filtered.length} experiences</span></div>
        <div className="price-filter-bar"><strong>Filter by price</strong><label>Minimum price <input type="number" min="0" inputMode="numeric" placeholder="৳ Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} /></label><label>Maximum price <input type="number" min="0" inputMode="numeric" placeholder="৳ Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} /></label><button type="button" className="btn btn-line btn-sm" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>Clear</button></div>
        {loading && <div className="grid cards">{[0, 1, 2].map((n) => <div key={n} className="listing-card skeleton" />)}</div>}
        {error && <div className="notice"><strong>We couldn't load the trips just yet.</strong><p>Please check your connection and Firebase configuration, then try again.</p><button className="btn btn-line btn-sm" onClick={reload}>Try again</button></div>}
        {data?.length === 0 && <div className="empty"><p>No packages have been published yet.</p>{isAdmin ? <><button className="btn btn-primary" onClick={seed}>Add starter packages</button> <Link className="btn btn-line" to="/add-service">Create a package</Link></> : <p className="muted">Please check back soon.</p>}</div>}
        {!loading && !error && filtered.length === 0 && data?.length > 0 && <div className="empty"><p>No trips match “{search}”.</p><span className="muted">Try another destination or package name.</span></div>}
        <div className="grid cards listing-grid">
          {filtered.map((s, n) => <article className="listing-card" key={s.id}>
            <Link to={`/booking/${s.id}`} className="listing-photo"><SmartImg src={s.photoUrl} alt={s.name} width="520" height="390" /><span className="photo-badge">{n === 0 ? 'Popular choice' : 'Explore trip'}</span></Link>
            <div className="listing-content"><div className="listing-meta"><span><Icon name="pin" size={14} /> {s.location || 'Curated destination'}</span><span><Icon name="clock" size={14} /> {s.duration}</span></div>
              <Link to={`/booking/${s.id}`} className="listing-title"><h3>{s.name}</h3><Icon name="compass" size={18} /></Link>
              <p>{(s.description || '').slice(0, 105)}{(s.description || '').length > 105 ? '…' : ''}</p>
              <div className="listing-bottom"><span className="listing-price"><strong>{money(s.price)}</strong><small> / person</small></span><Link to={`/booking/${s.id}`} className="round-arrow" aria-label={`View ${s.name}`}><Icon name="arrow-right" size={18} /></Link></div>
            </div>
          </article>)}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const [visible, setVisible] = useState(6);
  const [liked, setLiked] = useState({});
  const toast = useToast();
  const share = async (url) => {
    try { if (navigator.share) await navigator.share({ title: 'visitNature gallery', url }); else { await navigator.clipboard.writeText(url); toast('Photo link copied.'); } }
    catch { /* share cancelled */ }
  };
  return (
    <section className="section gallery-section" id="gallery">
      <div className="container">
        <div className="section-heading-row"><div><span className="eyebrow">POSTCARDS FROM THE ROAD</span><h2>A little look around</h2><p>Real places. Fresh air. Moments worth keeping.</p></div><span className="gallery-note">The visitNature journal <Icon name="compass" size={17} /></span></div>
        <div className="gallery bento-gallery">
          {gallery.slice(0, visible).map((src, n) => <figure className={`bento-item bento-${n % 8}`} key={src}>
            <SmartImg src={src} alt={`Travel moment ${n + 1}`} hideOnError referrerPolicy="no-referrer" loading="lazy" />
            <figcaption><button onClick={() => setLiked((l) => ({ ...l, [n]: !l[n] }))} aria-pressed={!!liked[n]} aria-label="Save photo" className={liked[n] ? 'on' : ''}><Icon name="heart" size={18} fill={!!liked[n]} /></button><button onClick={() => share(src)} aria-label="Share photo"><Icon name="share" size={18} /></button></figcaption>
          </figure>)}
        </div>
        {visible < gallery.length && <p className="center"><button className="btn btn-line" onClick={() => setVisible((v) => v + 6)}>See more moments <Icon name="plus" size={16} /></button></p>}
      </div>
    </section>
  );
}

function ClosingCallout() {
  return <section className="closing-section"><div className="container closing-card"><div><span className="eyebrow">LET'S MAKE IT HAPPEN</span><h2>Your next favourite memory is out there.</h2><p>Find a trip that feels right, and let the planning start here.</p></div><a className="btn btn-white" href="#packages">Explore experiences <Icon name="arrow-right" size={17} /></a></div></section>;
}

export default function Home() {
  const [search, setSearch] = useState('');
  const servicesState = useAsync(getServices, []);
  useSeo({ description: 'Discover thoughtful nature trips and memorable getaways with visitNature. Explore destinations in Bangladesh and beyond.', path: '/' });
  return <><SearchIntro query={search} setQuery={setSearch} services={servicesState.data} loading={servicesState.loading} /><DestinationRail /><Packages search={search} {...servicesState} /><Gallery /><ClosingCallout /></>;
}
