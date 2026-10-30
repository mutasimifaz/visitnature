import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { addTravelPost, getPublishedPosts, uploadImage } from '../api';
import { useToast } from '../ToastContext';
import { useSeo } from '../lib';
import SmartImg from '../components/SmartImg';
import Icon from '../components/Icon';

const base = 'https://demo.bosathemes.com/travele/wp-content/uploads/sites/13/2021/08/';
const STARTER_POSTS = [
  { id: 's1', title: 'Life is a beautiful journey, not a destination', img: 'img6.jpg', date: 'May 05, 2026', text: 'Why the slowest day of a trip is often the one you remember longest.' },
  { id: 's2', title: 'Take only memories, leave only footprints', img: 'img4.jpg', date: 'May 02, 2026', text: 'Simple habits that keep beaches and hills clean for the next traveller.' },
  { id: 's3', title: 'Journeys are best measured in new friends', img: 'img5.jpg', date: 'April 28, 2026', text: 'How group trips turn strangers into the people you plan the next one with.' },
];

export default function Blog() {
  const { user } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  useSeo({ title: 'Travel blog', description: 'Travel notes, trip ideas and stories from visitNature travellers.', path: '/blog' });

  useEffect(() => {
    let live = true;
    getPublishedPosts().then((items) => { if (live) setPosts(items); }).catch((e) => { console.error(e); if (live) setError('Community stories could not be loaded. Check your connection and Firestore rules.'); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  const chooseImages = (files) => {
    const list = Array.from(files || []);
    if (list.length > 5) { toast('You can upload up to 5 photos per story.', 'error'); return; }
    if (list.some((f) => !f.type.startsWith('image/'))) { toast('Please select image files only.', 'error'); return; }
    if (list.some((f) => f.size > 8 * 1024 * 1024)) { toast('Each image must be 8 MB or smaller.', 'error'); return; }
    previews.forEach((url) => URL.revokeObjectURL(url));
    setSelected(list);
    setPreviews(list.map((f) => URL.createObjectURL(f)));
  };

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!user) return toast('Sign in with Google before publishing a travel story.', 'error');
    if (!selected.length) return toast('Add at least one photo from your trip.', 'error');
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const imageUrls = await Promise.all(selected.map(uploadImage));
      await addTravelPost({ title: String(f.get('title')).trim(), place: String(f.get('place')).trim(), story: String(f.get('story')).trim(), imageUrls, authorName: user.displayName || 'Traveller', authorUid: user.uid });
      const fresh = await getPublishedPosts();
      setPosts(fresh);
      form.reset();
      previews.forEach((url) => URL.revokeObjectURL(url));
      setSelected([]); setPreviews([]);
      toast('Your travel story has been published.');
    } catch (err) {
      console.error(err);
      toast(err.message || 'Could not publish your story. Please try again.', 'error');
    } finally { setBusy(false); }
  };

  return (
    <main className="section"><div className="container">
      <div className="section-head"><p className="eyebrow">THE VISITNATURE JOURNAL</p><h1>Travel notes</h1><p>Real places, personal stories and little discoveries from the road.</p></div>
      <section className="community-write form-card">
        <div><p className="eyebrow">YOUR JOURNEY, YOUR STORY</p><h2>Write about a place you visited</h2><p className="muted">Share your experience and photos with the visitNature community.</p></div>
        {!user ? <p className="review-hint">Sign in with Google to write and publish a travel story.</p> : <form onSubmit={submit}>
          <label>Story title<input name="title" maxLength="110" placeholder="A weekend among the hills of Sajek" required /></label>
          <label>Place visited<input name="place" maxLength="100" placeholder="Sajek Valley, Rangamati" required /></label>
          <label>Your story<textarea name="story" rows="6" minLength="40" maxLength="5000" placeholder="Tell us what you experienced, what you loved and what other travellers should know…" required /></label>
          <label>Trip photos <span className="muted">(up to 5 images, 8 MB each)</span><span className="file"><Icon name="images" size={18} /><input type="file" accept="image/*" multiple onChange={(e) => chooseImages(e.target.files)} /></span></label>
          {previews.length > 0 && <div className="upload-preview-grid">{previews.map((src, i) => <div className="upload-preview" key={src}><img src={src} alt={`Selected photo ${i + 1}`} /><span>{selected[i]?.name}</span><button type="button" aria-label={`Remove ${selected[i]?.name}`} onClick={() => { URL.revokeObjectURL(src); setSelected((a) => a.filter((_, n) => n !== i)); setPreviews((a) => a.filter((_, n) => n !== i)); }}><Icon name="x" size={15} /></button></div>)}</div>}
          <button className="btn btn-sun" disabled={busy}>{busy ? 'Uploading & publishing…' : 'Publish my story'}</button>
        </form>}
      </section>
      <div className="section-head blog-list-head"><h2>Stories from the community</h2><p>Ideas and inspiration from travellers like you.</p></div>
      {loading ? <div className="page-loading small"><span className="spinner" /></div> : error ? <p className="notice">{error}</p> : <div className="grid cards blog-community-grid">
        {posts.map((p) => <article className="card" key={p.id}><div className="blog-post-gallery">{(p.imageUrls || []).slice(0, 3).map((src, i) => <SmartImg key={src} src={src} alt={`${p.title} photo ${i + 1}`} width="500" height="350" />)}</div><div className="card-body"><p className="meta"><Icon name="map-pin" size={14} /> {p.place} · {p.authorName || 'Traveller'}</p><h3>{p.title}</h3><p>{p.story}</p></div></article>)}
        {STARTER_POSTS.map((p) => <article className="card" key={p.id}><div className="card-img"><SmartImg src={base + p.img} alt={p.title} width="400" height="300" referrerPolicy="no-referrer" /></div><div className="card-body"><p className="meta"><Icon name="calendar" size={14} /> {p.date} · visitNature</p><h3>{p.title}</h3><p>{p.text}</p></div></article>)}
        {!posts.length && !STARTER_POSTS.length && <p className="empty">No stories have been published yet.</p>}
      </div>}
    </div></main>
  );
}
