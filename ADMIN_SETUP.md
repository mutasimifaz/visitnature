# Firebase administrator setup

The browser-side admin check and Firestore security rules must use the same Google account email.

1. Create a local `.env` file beside `package.json` (do not commit it).
2. Set `VITE_ADMIN_EMAILS=your-google-account@gmail.com`. Multiple admins can be comma-separated.
3. Open `firestore.rules` and replace `you@gmail.com` in `isAdmin()` with the same verified Google account email. Keep the quotes.
4. Publish the rules to the Firebase project selected in `.firebaserc`.
5. In Firebase Authentication, enable Google sign-in and add the deployed website domain to Authorized domains.
6. Restart the Vite dev server after changing `.env`. For hosting, push the updated files and set the same `VITE_ADMIN_EMAILS` value in the hosting provider's build environment before rebuilding.

Do not make bookings publicly readable or grant public writes to services. The supplied rules intentionally restrict each traveller to their own bookings and reserve package management/booking approval for verified administrators.

## Booking detail route

`/booking-details/:id` is available to the booking owner and configured administrators. The Firestore rules enforce the same ownership boundary; the route is not a substitute for security rules.


## Reviews and community travel stories

- Publish the updated `firestore.rules` before using reviews or blog submissions. The rules add public read access to published travel stories and reviews, while requiring a signed-in traveller to have a matching `Completed` booking before creating a review. A booking can receive one review.
- In **Manage bookings**, approve a booking first. After the trip has happened, use **Mark completed**. The traveller will then see the review form on that service's detail page (`/booking/:serviceId`).
- The Blog page allows signed-in users to publish a story with up to five photos. Service create/edit forms support up to eight photos. Both upload flows use `VITE_IMGBB_KEY`; set it in `.env` locally and in your hosting build environment.
- The service dashboard now has an **Edit** action. Existing image URLs are retained unless removed in the edit form.


## Booking creation rule fix
The `/bookings` create rule must not compare `reviewId` to `request.resource.data.bookingId`: `addDoc()` generates a document ID, and the booking payload does not contain a bookingId. The current `firestore.rules` validates the signed-in email, required booking fields and a guest count from 1–6. Publish these rules in Firebase Console → Firestore Database → Rules. Replace the placeholder admin email in `isAdmin()` with the same verified email used in `VITE_ADMIN_EMAILS`.
