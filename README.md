# HimBhumi Real Estates

Premium real estate website for Himachal Pradesh properties — Next.js 15 (App Router) + MongoDB.

## Features
- Full-screen autoplay video hero, property grid with location filters, property detail pages
- "List Your Property" submission flow with **Email OTP verification** (Nodemailer / SMTP)
- Admin panel: approve, reject, edit, delete, mark verified/featured (approval publishes to `properties`)
- Listing status tracker by Listing ID (`/track`)

## Run locally in VS Code

Requirements: Node.js 20+, Yarn, MongoDB running locally (or an Atlas connection string).

```bash
yarn install
cp .env.example .env      # then fill in your values
yarn dev                  # http://localhost:3000
```

## Environment variables
See `.env.example`. Key ones:

| Variable | Purpose |
|---|---|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |
| `NEXT_PUBLIC_BASE_URL` | Public base URL of the app |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Real email OTP delivery. If blank or the provider rejects the send, the OTP is shown on screen instead so the flow keeps working. |
| `NEXT_PUBLIC_CLOUDINARY_*` | Optional cloud media storage; falls back to base64 storage |

> Brevo note: Brevo blocks SMTP relay from unauthorized server IPs. Add your server IP under
> Brevo → SMTP & API → Authorized IPs, and verify your sender address under Senders & Domains.

## Structure
```
app/
  api/[[...path]]/route.js   # all backend APIs (properties, listings, inquiries, email OTP)
  page.js                    # main UI (home, properties, detail, admin, listing form, tracker)
  list-your-property/page.js
  track/page.js
  layout.js, globals.css
components/ui/               # shadcn/ui components
```

## Key API endpoints
- `GET /api/properties`, `GET /api/properties/:id`, `POST /api/properties`
- `GET/POST /api/listings`, `PUT/DELETE /api/listings/:id`, `GET /api/listings?listingId=HB-XXXXXX`
- `POST /api/listings/verify/send`, `POST /api/listings/verify/check`
- `GET/POST /api/inquiries`

## Build for production
```bash
yarn build && yarn start
```
