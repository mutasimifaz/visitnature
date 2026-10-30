import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { addService, updateService, getService, completeBooking, approveBooking, deleteBooking, deleteService, getAllBookings, getBooking, getMyBookings, getServices, seedServices, uploadImage } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { money, useAsync, useSeo } from '../lib';
import Shell from '../components/Shell';
import SmartImg from '../components/SmartImg';
import Icon from '../components/Icon';

const Status = ({ value }) => <span className={`status ${value === 'Approved' || value === 'Completed' ? 'ok' : 'wait'}`}>{value}</span>;
const Loading = () => <div className="page-loading small"><span className="spinner" /></div>;

/* ---------- My bookings (traveller) ---------- */
export function MyBookings() {
  useSeo({ title: 'My bookings', path: '/my-bookings', noindex: true });
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, setData } = useAsync(() => getMyBookings(user.email), [user.email]);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await deleteBooking(id); setData((l) => l.filter((b) => b.id !== id)); toast('Booking cancelled.'); }
    catch { toast('Could not cancel. Try again.', 'error'); }
  };

  return (
    <Shell title={`My bookings${data ? ` (${data.length})` : ''}`}>
      {loading ? <Loading /> : error ? <p className="notice">Couldn’t load your bookings: {error.message || 'Check your connection and Firestore rules.'}</p> : data.length === 0 ? (
        <div className="empty"><p>You haven’t booked a trip yet.</p><Link to="/#packages" className="btn btn-sun">Find a package</Link></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Package</th><th>Price</th><th>Journey date</th><th>Status</th><th><span className="sr">Action</span></th></tr></thead>
            <tbody>
              {data.map((b) => (
                <tr key={b.id}>
                  <td data-l="Package"><strong>{b.serviceName}</strong><Link className="detail-link" to={`/booking-details/${b.id}`}>View details</Link></td>
                  <td data-l="Price">{money(b.price)}</td>
                  <td data-l="Date">{b.date}</td>
                  <td data-l="Status"><Status value={b.status} /></td>
                  <td><button className="link-danger" onClick={() => cancel(b.id)}><Icon name="trash" size={16} /> Cancel</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}

/* ---------- Manage bookings (admin) ---------- */
export function ManageBookings() {
  useSeo({ title: 'Manage bookings', path: '/manage-bookings', noindex: true });
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { data, loading, error, setData } = useAsync(() => (isAdmin ? getAllBookings() : Promise.resolve([])), [isAdmin]);

  const approve = async (id) => {
    try { await approveBooking(id); setData((l) => l.map((b) => (b.id === id ? { ...b, status: 'Approved' } : b))); toast('Booking approved.'); }
    catch { toast('Could not approve. Try again.', 'error'); }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try { await deleteBooking(id); setData((l) => l.filter((b) => b.id !== id)); toast('Booking deleted.'); }
    catch { toast('Could not delete. Try again.', 'error'); }
  };

  return (
    <Shell title={`Manage bookings${isAdmin && data ? ` (${data.length})` : ''}`} admin>
      {loading ? <Loading /> : error ? <p className="notice">Couldn’t load bookings: {error.message || 'Check Firestore rules and admin email configuration.'}</p> : data.length === 0 ? (
        <div className="empty"><p>No bookings yet.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Traveller</th><th>Package</th><th>Journey date</th><th>Status</th><th><span className="sr">Actions</span></th></tr></thead>
            <tbody>
              {data.map((b) => (
                <tr key={b.id}>
                  <td data-l="Traveller"><strong>{b.userName || 'Guest'}</strong><small>{b.email}</small><small>{b.phone}</small></td>
                  <td data-l="Package"><strong>{b.serviceName}</strong><small>{money(b.price)}</small><Link className="detail-link" to={`/booking-details/${b.id}`}>View details</Link></td>
                  <td data-l="Date">{b.date}</td>
                  <td data-l="Status"><Status value={b.status} /></td>
                  <td className="actions">
                    {b.status === 'Pending' && <button className="btn btn-ink btn-sm" onClick={() => approve(b.id)}><Icon name="check" size={16} /> Approve</button>}
                    {b.status === 'Approved' && <button className="btn btn-sun btn-sm" onClick={async () => { try { await completeBooking(b.id); setData((l) => l.map((x) => x.id === b.id ? { ...x, status: 'Completed' } : x)); toast('Trip marked as completed.'); } catch { toast('Could not update booking status.', 'error'); } }}>Mark completed</button>}
                    <button className="link-danger" onClick={() => remove(b.id)} aria-label="Delete booking"><Icon name="trash" size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}

/* ---------- Dashboard: manage services (admin) ---------- */
export function ManageServices() {
  useSeo({ title: 'Dashboard', path: '/dashboard', noindex: true });
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [visible, setVisible] = useState(6);
  const { data, loading, error, setData, reload } = useAsync(getServices, []);
  if (!isAdmin) return <Navigate to="/my-bookings" replace />;

  const remove = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try { await deleteService(id); setData((l) => l.filter((s) => s.id !== id)); toast('Package deleted.'); }
    catch { toast('Could not delete. Try again.', 'error'); }
  };
  const seed = async () => { try { await seedServices(); reload(); toast('Starter packages added.'); } catch { toast('Could not add packages.', 'error'); } };

  return (
    <Shell title="Manage services" admin actions={<Link to="/add-service" className="btn btn-sun btn-sm"><Icon name="plus" size={16} /> Add service</Link>}>
      {loading ? <Loading /> : error ? <p className="notice">Couldn’t load services: {error.message || 'Check Firebase configuration and Firestore rules.'}</p> : data.length === 0 ? (
        <div className="empty"><p>No packages yet.</p><button className="btn btn-ink" onClick={seed}>Add 3 starter packages</button></div>
      ) : (
        <>
          <div className="grid mini">
            {data.slice(0, visible).map((s) => (
              <article className="card" key={s.id}>
                <div className="card-img"><SmartImg src={s.photoUrl} alt={s.name} width="300" height="200" /></div>
                <div className="card-body">
                  <h3>{s.name}</h3>
                  <p className="meta">{s.duration} · {money(s.price)}</p>
                  <div className="service-admin-actions"><Link className="btn btn-line btn-sm" to={`/edit-service/${s.id}`}><Icon name="edit-3" size={15} /> Edit</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(s.id)}><Icon name="trash" size={16} /> Delete</button></div>
                </div>
              </article>
            ))}
          </div>
          <p className="center">
            {visible < data.length
              ? <button className="btn btn-line" onClick={() => setVisible((v) => v + 3)}>See more services</button>
              : <span className="muted">All packages are shown.</span>}
          </p>
        </>
      )}
    </Shell>
  );
}

/* ---------- Add/edit service (admin) ---------- */
function ServiceEditor({ editing = false }) {
  const { id } = useParams();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const { data: existing, loading } = useAsync(() => editing ? getService(id) : Promise.resolve(null), [id, editing]);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [groupPriceDraft, setGroupPriceDraft] = useState({});
  useEffect(() => { if (existing) setExistingImages(existing.imageUrls?.length ? existing.imageUrls : (existing.photoUrl ? [existing.photoUrl] : [])); }, [existing]);
  const choose = (files) => {
    const list = Array.from(files || []);
    if (list.length + existingImages.length > 8) return toast('A service can have up to 8 photos.', 'error');
    if (list.some((f) => !f.type.startsWith('image/') || f.size > 8 * 1024 * 1024)) return toast('Choose image files up to 8 MB each.', 'error');
    previews.forEach(URL.revokeObjectURL); setSelected(list); setPreviews(list.map((f) => URL.createObjectURL(f)));
  };
  const submit = async (e) => {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true);
    try {
      const uploaded = await Promise.all(selected.map(uploadImage));
      const imageUrls = [...existingImages, ...uploaded];
      const manual = String(f.get('photoUrl') || '').trim();
      if (manual && !imageUrls.includes(manual)) imageUrls.unshift(manual);
      if (!imageUrls.length) throw new Error('Add at least one service photo.');
      const groupTotalPrices = Object.fromEntries([1,2,3,4,5,6].map((n) => [String(n), Number(f.get(`group-total-${n}`) || 0)]));
      if ([1,2,3,4,5,6].some((n) => !Number.isFinite(groupTotalPrices[String(n)]) || groupTotalPrices[String(n)] <= 0)) throw new Error('Enter the complete journey price for every group size (1–6).');
      const data = { name: String(f.get('name')).trim(), description: String(f.get('description')).trim(), duration: String(f.get('duration')).trim(), price: groupTotalPrices['1'], groupTotalPrices, imageUrls, photoUrl: imageUrls[0] };
      if (editing) await updateService(id, data); else await addService(data);
      toast(editing ? 'Service updated.' : 'Service added.');
      window.location.assign('/dashboard');
    } catch (err) { toast(err.message || `Could not ${editing ? 'update' : 'add'} service.`, 'error'); } finally { setBusy(false); }
  };
  if (!isAdmin) return <Navigate to="/my-bookings" replace />;
  if (loading) return <Shell title={editing ? 'Edit service' : 'Add a service'} admin><Loading /></Shell>;
  if (editing && !existing) return <Shell title="Edit service" admin><p className="notice">Service not found.</p></Shell>;
  const allPreviews = [...existingImages.map((src) => ({ src, name: 'Saved image', saved: true })), ...previews.map((src, i) => ({ src, name: selected[i]?.name || 'Selected image', saved: false }))];
  return <Shell title={editing ? 'Edit service' : 'Add a service'} admin>
    <form className="form-card flat service-editor" onSubmit={submit}>
      <label>Package name<input name="name" defaultValue={existing?.name || ''} placeholder="Sajek Valley Premium" required /></label>
      <label>Description<textarea name="description" rows="5" defaultValue={existing?.description || ''} placeholder="What travellers will see and do" required /></label>
      <div className="two"><label>Duration<input name="duration" defaultValue={existing?.duration || ''} placeholder="3 Days, 2 Nights" required /></label><div className="price-base-note"><strong>Flexible group pricing</strong><small>Set the total journey price for each group size below. The per-person price is calculated automatically.</small></div></div>
      <section className="tier-editor"><div><h3>Complete journey price by group size</h3><p>Enter what the whole group pays — not the price per person. Example: 4 travellers = ৳15,000 total, which works out to ৳3,750 each. The booking page will show ৳15,000, not ৳60,000.</p></div><div className="tier-editor-grid">{[1,2,3,4,5,6].map((n) => { const savedTotal = existing?.groupTotalPrices?.[String(n)] ?? (n === 1 ? Number(existing?.price || 0) : ''); const currentTotal = groupPriceDraft[n] ?? savedTotal; return <label key={n}><span>{n} {n === 1 ? 'traveller' : 'travellers'} · total</span><div className="tier-input"><b>৳</b><input name={`group-total-${n}`} type="number" min="1" step="1" defaultValue={savedTotal || ''} placeholder={`Total for ${n}`} onChange={(e) => setGroupPriceDraft((prev) => ({ ...prev, [n]: e.target.value }))} required /></div><small>{currentTotal ? `${money(Number(currentTotal) / n)} per person` : 'Enter group total'}</small></label>; })}</div></section>
      <label>Service photos <span className="muted">(up to 8 images total, 8 MB each)</span><span className="file"><Icon name="images" size={18} /><input type="file" accept="image/*" multiple onChange={(e) => choose(e.target.files)} /></span></label>
      <label>…or add an image URL<input name="photoUrl" type="url" placeholder="https://…" /></label>
      {allPreviews.length > 0 && <div className="upload-preview-grid">{allPreviews.map((img, i) => <div className="upload-preview" key={`${img.src}-${i}`}><img src={img.src} alt={`Service photo ${i + 1}`} /><span>{img.name}</span><button type="button" aria-label="Remove image" onClick={() => { if (img.saved) setExistingImages((a) => a.filter((_, n) => n !== i)); else { const n = i - existingImages.length; URL.revokeObjectURL(previews[n]); setSelected((a) => a.filter((_, j) => j !== n)); setPreviews((a) => a.filter((_, j) => j !== n)); } }}><Icon name="x" size={15} /></button></div>)}</div>}
      <button className="btn btn-sun" disabled={busy}>{busy ? 'Uploading & saving…' : editing ? 'Save changes' : 'Add service'}</button>
    </form>
  </Shell>;
}
export function AddService() { useSeo({ title: 'Add service', path: '/add-service', noindex: true }); return <ServiceEditor />; }
export function EditService() { useSeo({ title: 'Edit service', path: '/edit-service', noindex: true }); return <ServiceEditor editing />; }

/* ---------- Booking detail (admin + booking owner) ---------- */
export function BookingDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const { data: booking, loading, error, reload, setData } = useAsync(() => getBooking(id), [id]);

  const approve = async () => {
    try {
      await approveBooking(id);
      setData((current) => current ? { ...current, status: 'Approved' } : current);
      toast('Booking approved.');
    } catch (e) {
      console.error(e);
      toast('Could not approve this booking. Check administrator permissions.', 'error');
    }
  };
  const complete = async () => {
    try {
      await completeBooking(id);
      setData((current) => current ? { ...current, status: 'Completed' } : current);
      toast('Trip marked as completed. The traveller can now leave a review.');
    } catch (e) {
      console.error(e);
      toast('Could not complete this booking. Check administrator permissions.', 'error');
    }
  };

  if (loading) return <div className="page-loading"><span className="spinner" /></div>;
  if (error) return <main className="section"><div className="container"><p className="notice">Could not load this booking. Check your connection and Firestore permissions.</p><button className="btn btn-line" onClick={reload}>Try again</button></div></main>;
  if (!booking || (!isAdmin && booking.email !== user?.email)) {
    return <main className="section"><div className="container empty"><h1>Booking not found</h1><p>This booking may not exist or you may not have permission to view it.</p><Link className="btn btn-ink" to={isAdmin ? '/manage-bookings' : '/my-bookings'}>Back to bookings</Link></div></main>;
  }

  return (
    <main className="section">
      <div className="container detail-page">
        <div className="panel-head"><div><p className="eyebrow">BOOKING REFERENCE</p><h1>Booking details</h1><p className="muted">#{booking.id}</p></div><Status value={booking.status || 'Pending'} /></div>
        <div className="detail-grid">
          <section className="form-card">
            <h2>Traveller information</h2>
            <dl className="detail-list">
              <div><dt>Name</dt><dd>{booking.userName || '—'}</dd></div>
              <div><dt>Email</dt><dd>{booking.email || '—'}</dd></div>
              <div><dt>Phone</dt><dd>{booking.phone || '—'}</dd></div>
              <div><dt>Pickup address</dt><dd>{booking.address || '—'}</dd></div>
              <div><dt>Journey date</dt><dd>{booking.date || '—'}</dd></div>
              <div><dt>Travellers</dt><dd>{booking.guestCount || 1} {(booking.guestCount || 1) === 1 ? 'person' : 'people'}</dd></div>
            </dl>
          </section>
          <section className="form-card">
            {booking.photoUrl && <SmartImg className="detail-photo" src={booking.photoUrl} alt={booking.serviceName || 'Tour package'} />}
            <p className="eyebrow">SELECTED PACKAGE</p><h2>{booking.serviceName || 'Tour package'}</h2>
            <p className="price big">{money(booking.price)} <small>per person</small></p>
            <p className="booking-total"><span>Total for {booking.guestCount || 1} {(booking.guestCount || 1) === 1 ? 'person' : 'people'}</span><strong>{money(booking.totalPrice ?? booking.price)}</strong></p>
            <p className="muted">Status: {booking.status || 'Pending'}</p>
            {isAdmin && booking.status === 'Pending' && <button className="btn btn-sun" onClick={approve}>Approve booking</button>}
            {isAdmin && booking.status === 'Approved' && <button className="btn btn-sun" onClick={complete}>Mark trip completed</button>}
            <Link className="btn btn-line" to={isAdmin ? '/manage-bookings' : '/my-bookings'}>Back to bookings</Link>
          </section>
        </div>
      </div>
    </main>
  );
}
