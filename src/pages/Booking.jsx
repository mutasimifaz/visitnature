import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { createBooking, getService, getServiceReviews, addServiceReview, getMyBookings } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { money, useAsync, useSeo, SITE } from '../lib';
import SmartImg from '../components/SmartImg';
import Icon from '../components/Icon';

export default function Booking() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: s, loading } = useAsync(() => getService(id), [id]);
  const [busy, setBusy] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [eligible, setEligible] = useState([]);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [activePhoto, setActivePhoto] = useState(0);
  const photos = useMemo(() => [...new Set([...(s?.imageUrls || []), s?.photoUrl].filter(Boolean))], [s]);
  // groupTotalPrices is the canonical schema: each entry is the COMPLETE
  // journey price for that group size (never a per-person amount).
  // Until an admin configures a tier, keep the single-person base price as-is;
  // never multiply it by the selected traveller count.
  const hasGroupPrice = guestCount === 1 || s?.groupTotalPrices?.[String(guestCount)] != null;
  const totalPrice = Number(
    s?.groupTotalPrices?.[String(guestCount)] ?? (guestCount === 1 ? s?.price : 0) ?? 0
  );
  const pricePerPerson = guestCount > 0 ? totalPrice / guestCount : 0;

  useEffect(() => {
    let active = true;
    getServiceReviews(id).then((items) => { if (active) setReviews(items); }).catch((e) => console.error('Reviews:', e));
    if (user?.email) getMyBookings(user.email).then((items) => { if (active) setEligible(items.filter((b) => b.serviceId === id && b.status === 'Completed')); }).catch((e) => console.error('Review eligibility:', e));
    else setEligible([]);
    return () => { active = false; };
  }, [id, user?.email]);

  const unreviewedBooking = eligible.find((b) => !reviews.some((r) => r.bookingId === b.id));

  useSeo({
    title: s ? s.name : 'Book a trip',
    description: s ? `${s.name}: ${s.duration}, ${money(s.price)} per person. ${(s.description || '').slice(0, 110)}` : undefined,
    path: `/booking/${id}`,
    image: s?.photoUrl,
    jsonLd: s && {
      '@context': 'https://schema.org', '@type': 'TouristTrip', name: s.name, description: s.description,
      image: s.photoUrl?.startsWith('http') ? s.photoUrl : `${SITE}${s.photoUrl}`,
      offers: { '@type': 'Offer', price: s.price, priceCurrency: 'BDT', url: `${SITE}/booking/${id}` },
    },
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!hasGroupPrice) { toast('This group size has no price configured yet. Please contact us or choose another group size.', 'error'); return; }
    const f = new FormData(e.target);
    setBusy(true);
    try {
      await createBooking({
        userId: user.uid, userName: String(f.get('userName')).trim(), email: user.email, phone: String(f.get('phone')).trim(), address: String(f.get('address')).trim(), date: String(f.get('date')),
        serviceId: id, serviceName: s.name, price: pricePerPerson, basePrice: Number(s.price || 0), guestCount, totalPrice, groupTotalPrice: totalPrice, groupTotalPrices: s.groupTotalPrices || null, photoUrl: photos[0] || '',
      });
      navigate('/order-placed');
    } catch (err) {
      console.error('Booking submission failed:', { code: err?.code, message: err?.message, error: err });
      const detail = err?.code === 'permission-denied' ? 'Firestore denied this booking. Check the published bookings rule and signed-in email.' : (err?.message || 'Unknown error');
      toast(`Booking failed: ${detail}`, 'error');
      setBusy(false);
    }
  };

  if (loading) return <div className="page-loading"><span className="spinner" /></div>;
  if (!s) return (
    <main className="section"><div className="container empty"><h1>Package not found</h1><p>It may have been removed.</p><Link className="btn btn-ink" to="/#packages">See all packages</Link></div></main>
  );

  return (
    <main className="section">
      <div className="container booking">
        <article className="summary">
          <div className="service-carousel" aria-label="Service photos">
            <div className="service-carousel-main">{photos.length ? <SmartImg src={photos[activePhoto]} alt={`${s.name} photo ${activePhoto + 1}`} width="1200" height="800" loading="eager" /> : <div className="service-carousel-empty">No photos available</div>}
              {photos.length > 1 && <><button type="button" className="carousel-arrow prev" aria-label="Previous photo" onClick={() => setActivePhoto((i) => (i - 1 + photos.length) % photos.length)}><Icon name="chevron-left" size={22} /></button><button type="button" className="carousel-arrow next" aria-label="Next photo" onClick={() => setActivePhoto((i) => (i + 1) % photos.length)}><Icon name="chevron-right" size={22} /></button><span className="carousel-count">{activePhoto + 1} / {photos.length}</span></>}
            </div>
            {photos.length > 1 && <div className="service-carousel-thumbs">{photos.map((src, i) => <button type="button" key={`${src}-${i}`} className={i === activePhoto ? 'active' : ''} onClick={() => setActivePhoto(i)} aria-label={`Show photo ${i + 1}`} aria-pressed={i === activePhoto}><SmartImg src={src} alt="" width="160" height="110" /></button>)}</div>}
          </div>
          <h1 className="h2">{s.name}</h1>
          <p className="meta"><Icon name="clock" size={16} /> {s.duration}</p>
          <p>{s.description}</p>
          <p className="price big">{hasGroupPrice ? money(totalPrice) : 'Price unavailable'} <small>{hasGroupPrice ? `total for ${guestCount} ${guestCount === 1 ? 'traveller' : 'travellers'} · ${money(pricePerPerson)} per person` : 'This group size has not been priced yet'}</small></p>
        </article>

        <div className="form-card">
          <h2>Complete your booking</h2>
          {!user ? (
            <>
              <p className="muted">Sign in with Google to book this package.</p>
              <Link to="/login" state={{ from: location }} className="btn btn-sun">Sign in to book</Link>
            </>
          ) : (
            <form onSubmit={submit}>
              <label>Full name<input name="userName" defaultValue={user.displayName || ''} required autoComplete="name" /></label>
              <label>Email<input value={user.email} readOnly /></label>
              <label>Contact number<input name="phone" type="tel" placeholder="017XXXXXXXX" required autoComplete="tel" /></label>
              <label>Pickup address<textarea name="address" rows="3" placeholder="House, road, area, city" required /></label>
              <fieldset className="guest-picker"><legend>Who's travelling?</legend><p className="field-hint">Choose the group size to see its price.</p><div className="guest-options">{[1,2,3,4,5,6].map((n) => <button type="button" key={n} className={guestCount === n ? 'guest-option active' : 'guest-option'} onClick={() => setGuestCount(n)} aria-pressed={guestCount === n}><strong>{n}</strong><span>{n === 1 ? 'Person' : 'People'}</span></button>)}</div></fieldset>
              <label>Journey date<input name="date" type="date" min={new Date().toISOString().slice(0, 10)} required /></label>
              <div className="booking-total"><span><strong>{hasGroupPrice ? money(pricePerPerson) : 'Price unavailable'}</strong>{hasGroupPrice ? ` per person · ${guestCount} ${guestCount === 1 ? 'traveller' : 'travellers'}` : ' · this group size has not been priced yet'}{guestCount > 1 && hasGroupPrice ? <small className="tier-note">Group total price</small> : null}</span><strong>{hasGroupPrice ? money(totalPrice) : '—'}</strong></div>
              {!hasGroupPrice && <p className="notice">This group price hasn't been configured yet. Please contact the team or select a group size with an available price.</p>}
              <button className="btn btn-sun btn-block" disabled={busy || !hasGroupPrice}>{busy ? 'Booking…' : 'Confirm booking'}</button>
            </form>
          )}
        </div>
        <section className="service-reviews">
            <div className="reviews-heading"><div><p className="eyebrow">TRAVELLER STORIES</p><h2>Reviews from our guests</h2><p className="muted">Only travellers with a completed booking for this experience can leave a review.</p></div><span className="review-count">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span></div>
            {unreviewedBooking && (
              <form className="form-card review-form" onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); setReviewBusy(true); setReviewError(''); try { await addServiceReview({ serviceId: id, bookingId: unreviewedBooking.id, userId: user.uid, userName: user.displayName || 'Traveller', email: user.email, rating: Number(f.get('rating')), title: String(f.get('title')).trim(), comment: String(f.get('comment')).trim() }); setReviews(await getServiceReviews(id)); form.reset(); setReviewRating(5); } catch (err) { setReviewError(err.message || 'Could not submit your review.'); } finally { setReviewBusy(false); } }}>
                <h3>Share your experience</h3><fieldset className="rating-picker"><legend>Your rating</legend><div className="rating-stars" role="radiogroup" aria-label="Choose a rating">{[1,2,3,4,5].map((n) => <button type="button" key={n} className={n <= reviewRating ? 'rating-star selected' : 'rating-star'} onClick={() => setReviewRating(n)} role="radio" aria-checked={reviewRating === n} aria-label={`${n} out of 5 stars`}>★</button>)}<span>{['','Not for me','Could be better','It was good','Really enjoyed it','Loved it'][reviewRating]}</span></div><input type="hidden" name="rating" value={reviewRating} /></fieldset><label>Review title<input name="title" maxLength="90" placeholder="A trip worth remembering" required /></label><label>Your review<textarea name="comment" rows="4" minLength="20" maxLength="1200" placeholder="Tell other travellers what you enjoyed…" required /></label>{reviewError && <p className="notice">{reviewError}</p>}<button className="btn btn-sun" disabled={reviewBusy}>{reviewBusy ? 'Submitting…' : 'Publish review'}</button>
              </form>
            )}
            {user && eligible.length === 0 && <p className="review-hint">Your review option will appear here after an administrator marks your booking as completed.</p>}
            {!user && <p className="review-hint">Sign in and complete a trip with us to share a review.</p>}
            {reviews.length ? <div className="review-list">{reviews.map((r) => <article className="review-card" key={r.id}><div className="review-card-top"><strong>{r.userName || 'Traveller'}</strong><span className="review-stars">{'★'.repeat(Math.max(1, Math.min(5, Number(r.rating) || 5)))}</span></div><h3>{r.title}</h3><p>{r.comment}</p></article>)}</div> : <p className="review-hint">No reviews yet. Be the first eligible traveller to share your experience.</p>}
        </section>
      </div>
    </main>
  );
}
