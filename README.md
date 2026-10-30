# visitNature (2026 rebuild)

React 18 + Vite + Firebase (Auth, Firestore). No Node/Express server. Images optionally on imgbb. Installable PWA.

## Run locally
1. `npm install`
2. Edit `.env` (copy of `.env.example`): set `VITE_ADMIN_EMAILS` to your Google email, optionally `VITE_IMGBB_KEY`.
3. `npm run dev` → http://localhost:5173

## One-time Firebase setup (project `visit-nature-85ca3`)
1. Console → **Build → Authentication → Sign-in method** → enable **Google**. Under Settings → Authorized domains, make sure `localhost` is listed.
2. Console → **Build → Firestore Database** → Create database (production mode).
3. Put your admin email into `firestore.rules` (`isAdmin()` list), then paste the file into **Firestore → Rules → Publish** (or `firebase deploy --only firestore:rules`).
4. Log in on the site with that email, open the home page, press **Add 3 starter packages** (or use Dashboard → Add service).

## Test the PWA / production build
`npm run build && npm run preview` → open http://localhost:4173 → Chrome menu → **Install visitNature**.
(The service worker only runs in the production build, not in `npm run dev`.)

## Deploy
`npm run build && npx firebase-tools deploy` (Hosting + Firestore rules). Then set `VITE_SITE_URL` in `.env` and replace the
domain inside `public/robots.txt` and `public/sitemap.xml` with yours.

## Old API → Firebase
| Express route | Now |
|---|---|
| GET/POST/DELETE `/services` | Firestore `services` (`src/api.js`) |
| POST `/bookings`, GET `/myBookings/:email` | Firestore `bookings` where `email == user.email` |
| GET `/bookings`, PUT (approve), DELETE | Admin-only Firestore reads / `updateDoc` / `deleteDoc` |
