# visitNature design refresh

This refresh moves the customer-facing experience toward a light, photo-led travel marketplace inspired by Airbnb's broad design principles without copying its branding.

## Visual direction
- White and warm-neutral page surfaces with dark charcoal typography.
- Restrained coral accent for primary actions.
- Compact navigation and a prominent destination search field.
- Destination discovery tiles and consistent, image-first trip cards.
- Asymmetric bento gallery with responsive mobile composition.
- Smaller typography, subtle borders, and minimal shadows.

## Functional changes
- Homepage search filters loaded packages by name, description, and duration.
- Admin booking rows now link to an individual booking detail screen at `/manage-bookings/:id`.
- Booking detail screen displays traveller, contact, pickup, trip, price, and status information, with an approve action for admins.
- Dashboard navigation is hidden from non-admin users.

## Verification
- JS/JSX syntax parsing passed with the TypeScript compiler's JSX parser.
- A production Vite build was not run because dependency installation could not complete in this environment. Run `npm ci` and `npm run build` locally before publishing.
