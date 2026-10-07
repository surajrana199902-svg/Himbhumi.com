# HimBhumi Real Estates

Premium real estate website for North India properties — Next.js 15 (App Router), JavaScript/JSX, Tailwind CSS, and MongoDB.

## Features
- Responsive property search with URL-backed price, BHK, type, listing type, and location filters; `/rentals` shows rent-only listings
- Saved properties, lazy-loaded 360° tour embeds, and North India state/UT location catalog
- Agent portal for tracking listing views and editing agent-owned submissions
- Google OAuth sign-in and account creation for users, plus allowlisted agent/admin access
- "List Your Property" submission flow with **Email OTP verification** (Nodemailer / SMTP)
- Admin panel: approve, reject, edit, delete, mark verified/featured (approval publishes to `properties`)
- Listing status tracker by Listing ID (`/track`)

## Run locally in VS Code

Requirements: Node.js 20+, npm, and MongoDB running locally (or an Atlas connection string).

```powershell
npx.cmd --yes yarn@1.22.22 install
Copy-Item .env.example .env
npm.cmd run dev            # http://localhost:3000
```

## Environment variables
See `.env.example`. Key ones:

| Variable | Purpose |
|---|---|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |
| `NEXT_PUBLIC_BASE_URL` | Public base URL of the app |
| `AGENT_USERNAME` / `AGENT_PASSWORD` | Optional pre-approved legacy agent account credentials |
| `AGENT_SESSION_SECRET` | High-entropy signing secret required for agent sessions and agent applications |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 web client credentials |
| `GOOGLE_ADMIN_CLIENT_ID` / `GOOGLE_ADMIN_CLIENT_SECRET` | Optional separate Google OAuth client for admin sign-in |
| `GOOGLE_AGENT_CLIENT_ID` / `GOOGLE_AGENT_CLIENT_SECRET` | Optional separate Google OAuth client for agent sign-in |
| `GOOGLE_REDIRECT_URI` | Exact OAuth callback URL registered in Google Cloud |
| `GOOGLE_OAUTH_SESSION_SECRET` | Unique random secret (at least 32 characters) for OAuth state and sessions |
| `ADMIN_GOOGLE_EMAILS` / `AGENT_GOOGLE_EMAILS` | Comma-separated email allowlists for elevated roles |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Real email OTP delivery. If blank or the provider rejects the send, the OTP is shown on screen instead so the flow keeps working. |
| `NEXT_PUBLIC_CLOUDINARY_*` | Optional cloud media storage; falls back to base64 storage |

### MongoDB Atlas

For persistent data, set `MONGO_URL` in `.env.local` to your Atlas connection string, set `DB_NAME`, allow your current public IP in Atlas Network Access, and ensure outbound TCP traffic to port `27017` is permitted. Percent-encode reserved characters in the username or password (for example, `@` as `%40`); Atlas database users normally authenticate against `authSource=admin`. If MongoDB reports an authentication failure after TLS succeeds, verify the Atlas Database Access username/password and reset the database user's password if needed. If TLS fails before authentication, check the Atlas IP access list and network/firewall rules; changing a password will not resolve a TLS handshake failure. Keep the connection string private and restart the server after changing it. The sample property catalogue is used only when `MONGO_URL` is not configured; if a configured database cannot be reached, API requests return an error rather than presenting stale data or reporting unsaved changes as successful.

> Brevo note: Brevo blocks SMTP relay from unauthorized server IPs. Add your server IP under
> Brevo → SMTP & API → Authorized IPs, and verify your sender address under Senders & Domains.

## Structure
```
app/
  api/[[...path]]/route.js   # all backend APIs (properties, listings, inquiries, email OTP)
  page.js                    # main UI (home, properties, detail, admin, listing form, tracker)
  list-your-property/page.js
  rentals/page.js
  agent/page.js
  saved/page.js
  track/page.js
  layout.js, globals.css
components/                   # reusable client UI and feature components
hooks/                        # client catalog and favorite state
lib/                          # location data and hierarchy helpers
components/ui/               # shadcn/ui components
```

## Key API endpoints
- `GET /api/properties`, `GET /api/properties/:id`, `POST /api/properties`
- `GET /api/properties?listingType=For%20rent` for rental-only results
- `GET/POST /api/listings`, `PUT/DELETE /api/listings/:id`, `GET /api/listings?listingId=HB-XXXXXX`
- `POST /api/listings/verify/send`, `POST /api/listings/verify/check`
- `GET/POST /api/inquiries`
- `GET /api/locations?q=Nalagarh`, `POST /api/locations`, `POST /api/locations/import`
- `GET /api/agent/session`, `POST /api/agent/login`, `GET /api/agent/listings`
- `PUT /api/agent/listings/:id` (agent-owned listings only), `POST /api/agent/logout`
- `GET/PUT /api/user/favorites` (authenticated Google user or agent's synced favorites)
- `GET /api/auth/google`, `GET /api/auth/google/callback`, `GET /api/auth/session`, `POST /api/auth/logout`
- `POST /api/properties/:id/view`

## Location catalog

The existing Nalagarh, Baddi, Solan, Shimla, Kasauli, Parwanoo, Dharamshala, Kangra, Palampur, Manali, Kullu, Mandi, Hamirpur, Bilaspur, Una, Chamba, Nahan, and Narkanda locations remain available. The existing 12 district choices are also retained. Their catalog records are seeded by stable IDs with upserts, so starting the app again does not duplicate or replace them; existing property IDs and their saved images are unchanged.

With MongoDB configured, sign in at `/admin` and use **Location catalog** to add a district, tehsil/sub-division, city/town, or village/locality beneath its parent. The catalog supplies each record's inherited state/district/tehsil, parent ID, and URL slug. Location search, property filters, public property-submission suggestions, and location pages use the same catalog. Location pages use `/locations/<state>/<district>/<tehsil>/<city>/<village>` and property detail URLs keep their existing IDs.

Punjab, Uttarakhand, Haryana, and Chandigarh are preloaded as additional state/UT choices. Their districts, cities, and properties are deliberately not fabricated: use the admin catalog to add their district → tehsil → city → locality records before accepting location-based listings. Existing Himachal Pradesh records and IDs are retained.

To add many locations without code changes:

1. Use **Export JSON** in the admin catalog to find existing parent IDs.
2. Import a JSON array with parents before children. IDs can be supplied for locations referenced by later records; duplicate names under the same parent/type are ignored.
3. Import up to 1,000 records per batch. Larger catalogs can be split into batches.

Example city followed by a village beneath that city:

```json
[
  {
    "id": "example-town",
    "name": "Example Town",
    "type": "city",
    "parentLocationId": "<existing-tehsil-id>"
  },
  {
    "id": "example-village",
    "name": "Example Village",
    "type": "village",
    "parentLocationId": "example-town"
  }
]
```

The location IDs shown above are examples only. Replace `<existing-tehsil-id>` with a real tehsil ID from the exported catalog. New property submissions can select these locations, and browsing a parent location includes properties assigned to its descendants. MongoDB must be reachable to persist additions; when it is offline, the pre-added catalog remains readable and writes report an error instead of pretending to save.

## Google sign-in and role access

1. Create **Web application** OAuth clients in Google Cloud Console. You can use the shared `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` pair, or separate `GOOGLE_ADMIN_CLIENT_ID` / `GOOGLE_ADMIN_CLIENT_SECRET` and `GOOGLE_AGENT_CLIENT_ID` / `GOOGLE_AGENT_CLIENT_SECRET` pairs. Configure the OAuth consent screen and add the applicable test users while the app is in testing.
2. Add the exact redirect URL to **Authorized redirect URIs on every client**: `http://localhost:3000/api/auth/google/callback` for local development, and `https://your-domain/api/auth/google/callback` in production.
3. Set the client ID/secret pairs and a unique random `GOOGLE_OAUTH_SESSION_SECRET` in the ignored `.env.local`. The session secret must be at least 32 characters; do not commit it. Role-specific client credentials select a Google OAuth client only; they do not grant application privileges.
4. Put administrator emails in `ADMIN_GOOGLE_EMAILS` and agent emails in `AGENT_GOOGLE_EMAILS` as comma-separated, lowercase addresses, then restart the app. Keep these lists server-side; a Google user cannot select their own elevated role.
5. Users can create/sign in to their account at `/login`. The first verified Google sign-in creates a record in MongoDB's `users` collection. Agents use `/agent`; administrators use `/admin`. Agent and admin accounts must be explicitly allowlisted. Admin takes precedence if an email appears in both lists.

The old password-based admin/agent sign-ins remain available for backward compatibility. Google OAuth uses a one-time CSRF state, Google's verified user profile, an HTTP-only signed session cookie, and an eight-hour session. User profile/session data are stored in MongoDB; Google access tokens are not retained. Agent listing ownership is keyed to the Google account subject, with existing username-owned listings still accessible to a matching allowlisted account.

## Search, saved properties, tours, and agents

The `/properties` filters support price bounds in lakhs (100 lakhs = ₹1 crore), multi-select BHK and property types, and shareable query parameters. Filter requests and URL updates are debounced by 300 ms. Property detail visits are counted once per browser tab session and the totals appear on listing cards, property details, and agent listings. Saved properties are kept in browser local storage for guests; signed-in Google users and agents merge/sync those IDs to MongoDB when authenticated.

Prospective agents can apply at `/agent` with an email and password. Applications are stored in MongoDB's `agents` collection with `status: "pending"` and a salted password hash. The admin dashboard shows pending applications and lets an administrator approve or reject them. Pending and rejected agents cannot sign in; approval is required before the application credentials are accepted. Configure `MONGO_URL`, `DB_NAME`, and a unique, high-entropy `AGENT_SESSION_SECRET` in the ignored `.env.local` for agent applications and sessions. The optional `AGENT_USERNAME` / `AGENT_PASSWORD` account and addresses in `AGENT_GOOGLE_EMAILS` remain explicitly pre-approved legacy access methods. Agents can submit listings while signed in to associate them with their account. Only the owning agent can edit their own submissions; admin approval continues to publish listings. Public property detail visits increment the listing's `views` count once per browser tab session.

The `/inbox` page provides persistent, role-aware conversations between verified Google users, approved agents, and administrators. Users can start a property conversation from its detail page or message an approved agent/administrator; agents can reply to their conversations and contact administrators; administrators can view and reply to all conversations. The existing public property-enquiry form remains available and creates an inbox conversation when the visitor is signed in. Inbox records are stored separately from the admin email outbox and are only readable by conversation participants or an authenticated administrator.

Listings may include a `virtualTourUrl` using HTTPS Matterport, Kuula, or Pannellum URLs. The iframe is not created until a user opens the tour and presses **Start 360° tour**. New photos and video URLs are provided through the existing listing media upload flow; no synthetic listings or unattributed regional photos/videos are seeded for the new states.

This codebase is JavaScript/JSX today. New components follow its existing App Router patterns instead of introducing a partial TypeScript conversion and extra build configuration.

## Build for production
```bash
npx.cmd --yes yarn@1.22.22 build
npm.cmd start
```
