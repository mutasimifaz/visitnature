import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { Private, LegacyBooking } from './components/Guards';
import Home from './pages/Home';
import Blog from './pages/Blog';
import About from './pages/About';
import Login from './pages/Login';
import Booking from './pages/Booking';
import { MyBookings, ManageBookings, ManageServices, AddService, EditService, BookingDetails } from './pages/Dash';
import { OrderPlaced, NotFound } from './pages/Misc';

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <div id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/orderReview/:id" element={<LegacyBooking />} />
          <Route path="/order-placed" element={<Private><OrderPlaced /></Private>} />
          <Route path="/my-bookings" element={<Private><MyBookings /></Private>} />
          <Route path="/booking-details/:id" element={<Private><BookingDetails /></Private>} />
          <Route path="/manage-bookings" element={<Private><ManageBookings /></Private>} />
          <Route path="/add-service" element={<Private><AddService /></Private>} />
          <Route path="/edit-service/:id" element={<Private><EditService /></Private>} />
          <Route path="/dashboard" element={<Private><ManageServices /></Private>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}
