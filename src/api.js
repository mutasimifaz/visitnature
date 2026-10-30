import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, deleteDoc, updateDoc,
  query, where, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const services = collection(db, 'services');
const bookings = collection(db, 'bookings');
const reviews = collection(db, 'reviews');
const posts = collection(db, 'posts');
const withId = (d) => ({ id: d.id, ...d.data() });
const newest = (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);

/* ---------- Services (was: GET/POST/DELETE /services) ---------- */
export const getServices = async () => (await getDocs(services)).docs.map(withId).sort(newest);
export const getService = async (id) => {
  const snap = await getDoc(doc(db, 'services', id));
  return snap.exists() ? withId(snap) : null;
};
export const addService = (data) => addDoc(services, { ...data, createdAt: serverTimestamp() });
export const deleteService = (id) => deleteDoc(doc(db, 'services', id));
export const updateService = (id, data) => updateDoc(doc(db, 'services', id), { ...data, updatedAt: serverTimestamp() });

/* ---------- Bookings (was: /bookings, /myBookings/:email) ---------- */
export const createBooking = (data) =>
  addDoc(bookings, { ...data, status: 'Pending', createdAt: serverTimestamp() });
export const getMyBookings = async (email) =>
  (await getDocs(query(bookings, where('email', '==', email)))).docs.map(withId).sort(newest);
export const getAllBookings = async () => (await getDocs(bookings)).docs.map(withId).sort(newest);
export const getBooking = async (id) => {
  const snap = await getDoc(doc(db, 'bookings', id));
  return snap.exists() ? withId(snap) : null;
};
export const approveBooking = (id) => updateDoc(doc(db, 'bookings', id), { status: 'Approved' });
export const completeBooking = (id) => updateDoc(doc(db, 'bookings', id), { status: 'Completed', completedAt: serverTimestamp() });
export const deleteBooking = (id) => deleteDoc(doc(db, 'bookings', id));

/* ---------- Image hosting on imgbb (free, no Firebase Storage plan needed) ---------- */
export async function uploadImage(file) {
  const key = import.meta.env.VITE_IMGBB_KEY;
  if (!key) throw new Error('Add VITE_IMGBB_KEY to .env to upload files, or paste an image URL instead.');
  if (file.size > 8 * 1024 * 1024) throw new Error('Image is larger than 8 MB. Choose a smaller one.');
  const body = new FormData();
  body.append('image', file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: 'POST', body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json?.error?.message || 'Image upload failed. Try again.');
  return json.data.display_url;
}

/* ---------- Starter packages for an empty database (admin button) ---------- */
export async function seedServices() {
  const items = [
    { name: 'Blue Meeru Island Escape', duration: '5 Days, 4 Nights', price: 85000, photoUrl: '/img/meeru.webp',
      description: 'Overwater stays, reef snorkelling and sunset sandbank dinners in the heart of the Maldives.' },
    { name: 'Kuakata Sunrise & Sunset', duration: '3 Days, 2 Nights', price: 6500, photoUrl: '/img/kuakata.webp',
      description: 'See the sun rise and set over the same beach, with Buddhist temples and Rakhine villages on the way.' },
    { name: 'Magical Bali Adventure', duration: '6 Days, 5 Nights', price: 72000, photoUrl: '/img/bali.webp',
      description: 'Rice terraces, temple mornings and surf afternoons with a local guide and private transfers.' },
  ];
  const batch = writeBatch(db);
  items.forEach((s) => batch.set(doc(services), { ...s, createdAt: serverTimestamp() }));
  await batch.commit();
}


/* ---------- Traveller reviews ---------- */
export const getServiceReviews = async (serviceId) =>
  (await getDocs(query(reviews, where('serviceId', '==', serviceId)))).docs.map(withId).sort(newest);
export const addServiceReview = (data) => setDoc(doc(db, 'reviews', data.bookingId), { ...data, createdAt: serverTimestamp() });

/* ---------- Community travel stories ---------- */
export const getPublishedPosts = async () =>
  (await getDocs(query(posts, where('status', '==', 'Published')))).docs.map(withId).sort(newest);
export const addTravelPost = (data) => addDoc(posts, { ...data, status: 'Published', createdAt: serverTimestamp() });
