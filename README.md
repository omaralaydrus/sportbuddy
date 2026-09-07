# SportBuddy

Find a court. Join a game. Meet your next sports buddy.

## Project status

The responsive SportBuddy prototype is implemented using the `innovation_license1` blueprint. It includes court discovery, local games, hosting, player connections, editable profiles, saved courts, Google Maps integration, and a server-side Rebana API connector.

Sports interactions are a browser-persisted demo, not a live multi-user service. Rebana credentials and a Google Maps key are not included. External Google Maps directions work immediately; interactive maps require configuration.

## App concept

SportBuddy helps people discover sports courts near their chosen location, find and join local games, and connect with other players. Users can also host a game and invite others to fill the available spots.

The first version is a responsive web app designed for mobile and desktop. A native mobile app can be considered later.

## Blueprint: innovation_license1

The reference is the existing [innovation_license1 project](../innovation_license1/README.md). SportBuddy will be a separate project, using its architecture and interface patterns as the starting point.

The reference currently includes both a layered sandbox integration and a Nexus Arena event interface. SportBuddy will adapt the useful structure and discovery flows to local physical sports.

| Blueprint element | SportBuddy adaptation |
| --- | --- |
| Next.js App Router, React, TypeScript | Same application foundation, with dependency compatibility checked during setup |
| Thin route files in `src/app/` | Routes compose feature pages; business logic stays outside route components |
| `src/modules/<feature>/pages/` | Dedicated discovery, courts, games, community, and profile page components under the SportBuddy module |
| Redux Toolkit actions, reducers, selectors, effects, and state | Preserve the feature store pattern for shared application state and asynchronous operations |
| Shared models, services, and components | Reusable sports data types, service interfaces, cards, filters, and status messages |
| Discovery hero and event cards | SportBuddy introduction, nearby courts, and games with available spots |
| Event detail and organizer pages | Game details and a host-game flow |
| CSS variables and responsive styling | SportBuddy design tokens and responsive components |
| Server-side credential handling | Keep future private service credentials on the server |

Following the request to use the Rebana API, the blueprint's server-side token broker and allowlisted proxy have been adapted into SportBuddy. Existing environment secrets, build output, and deployment configuration were not copied.

## Rebana API integration

Specification: [Rebana License sandbox OpenAPI](https://rebana.canang.com.my/rebana-license/v3/api-docs/sandbox). A fetched snapshot is saved in [sandbox.openapi.json](sandbox.openapi.json).

The published API exposes five read-only resources:

| Endpoint | Actual data |
| --- | --- |
| `/api/sandbox/ping` | Connection and credential status |
| `/api/sandbox/zones` | Council administrative zones |
| `/api/sandbox/license-types` | License and permit categories |
| `/api/sandbox/business-activities` | Business activity taxonomy |
| `/api/sandbox/statistics` | Licensing operational statistics |

It has no courts, geographic coordinates, bookings, sports games, player accounts, or connection mutations. These endpoints cannot serve as a live sports backend. Administrative zones are not treated as coordinates, and licensing totals are never shown as sports activity.

Open `/connection` from the footer to check configuration and load real reference data once credentials are configured. The app pages use demo sports data, kept separate from the API's live response viewer.

The browser calls SportBuddy's same-origin `/api/sandbox/*` route. The server obtains and caches an OAuth token, attaches it upstream, retries one 401 with a new token, and passes rate-limit metadata to a visible retry countdown. List reads page at 200 records until a short page. Unknown paths and invalid pagination are rejected; outbound calls have timeouts. The proxy exposes no sports write endpoints.

This reference-data proxy has no end-user authentication. Add access control before public deployment so visitors cannot consume a shared sandbox credential's quota.

## First-version features

### 1. Discover

- A clear introduction with “Find courts” and “Find a game” actions.
- Location selector, sport shortcuts, nearby courts, and upcoming games.
- A visible way to host a game.
- Suggested players based on shared sports and selected area.

### 2. Find courts

- Search by court name or area; filter by sport, distance, and indoor/outdoor facilities.
- Court cards with photo, name, area, supported sports, and distance when location is available.
- Court details with address, facilities, opening hours, indicative pricing, and games at that venue.
- Switch between a court list and a built-in Google Map with selectable court pins.
- Save courts and use “Open in Google Maps” or “Get directions” on court and game detail pages.
- Request browser location only when the user chooses “Use my location”; support manual area selection if permission is denied or unavailable.
- Calculate approximate straight-line distance from coordinates and label it accordingly. Do not imply driving distance or live availability.

Court discovery is included. Reserving a court, checking live booking slots, and taking payments are later integrations.

### Maps and directions

- Use Google Maps as the map provider, with an interactive map inside SportBuddy for nearby courts and game venues.
- Keep map pins and list results synchronized with sport, location, distance, and game filters. Selecting a pin opens a preview with a link to court or game details; group games at the same venue in the preview.
- On desktop, show a map alongside results; on mobile, provide a List/Map toggle. Keep the list accessible without interacting with the map.
- Center on the selected area, or device location after permission. Only show venue locations publicly, not live player locations.
- Provide “Search this area” after panning, so users control when results change.
- Add a venue map to court and game details, with links to Google Maps for navigation. Use stored coordinates and an optional Google Place ID to identify the destination.
- If the map cannot load or is not configured, keep search, lists, addresses, and external directions links usable. A fallback does not count as completion of the built-in map milestone.

The interactive map will use the Maps JavaScript API, which requires a Google Cloud project with billing and an API key. Restrict its browser-visible key to the app's allowed websites and required APIs; private server credentials remain server-only. See [Google Maps JavaScript API setup](https://developers.google.com/maps/documentation/javascript/get-api-key).

External Google Maps links work without an API key and open the Maps app or browser as supported by the device. Build encoded search/directions URLs using `api=1`; directions can omit the origin so Google Maps handles the starting location. See [Google Maps URLs documentation](https://developers.google.com/maps/documentation/urls/get-started).

The map displays SportBuddy's court catalog and game data. It does not automatically supply all nearby courts or live booking availability. Google Places search or address autocomplete can be added later if needed; manual area selection and stored venue coordinates support the initial scope.

### 3. Find and join games

- Search and filter games by sport, area/distance, date, and skill level.
- Show venue, start time, host, skill level, participant count, available spots, and any stated contribution per player.
- Game details include description, players, and clear join/leave actions.
- Joining updates membership and available spots; leaving releases the spot.
- Prevent duplicate joins and joining full, cancelled, or past games.
- Show joined and hosted games together in “My games”.

### 4. Host a game

- Choose sport, listed court, date/time, duration, skill level, capacity, and description.
- Optionally state a cost contribution; no payment collection in the first version.
- Validate required fields, future start time, and capacity. The host counts toward capacity.
- Allow the host to edit or cancel their game and view participants.
- Mark cancelled games clearly for participants.
- A hosted game does not represent a confirmed court reservation; hosts arrange venue access separately.

### 5. Connect with players

- Player profiles with display name, avatar, general area, bio, preferred sports, and skill levels.
- Discover players by area and sport.
- Send, accept, decline, and cancel connection requests; remove an existing connection.
- Show pending requests and connected players with consistent button states.
- Prevent self-connections and duplicate requests.

Direct messaging, group chat, push notifications, and a social feed are proposed follow-up features. The first version focuses on profiles and connection requests.

### 6. My profile

- Edit display name, bio, sports, skill levels, and general area.
- View saved courts, joined/hosted games, and connections.
- Keep precise device location out of public profiles.

## Routes and navigation

| Route | Purpose |
| --- | --- |
| `/` | Discover courts, games, and players |
| `/courts` | Court search and filters |
| `/courts/[id]` | Court information and related games |
| `/games` | Local game search and filters |
| `/games/[id]` | Game details and participation |
| `/games/new` | Host a game |
| `/my-games` | Joined and hosted games |
| `/community` | Player discovery and connection requests |
| `/players/[id]` | Player profile |
| `/profile` | Own profile and saved courts |

Primary navigation: Discover, Courts, Games, Community, and Profile. “Host a game” remains a prominent action; “My games” is accessible from Games and the profile area.

## Design direction

Use the blueprint's strong headings, discovery sections, cards, and clear navigation, adapted to a friendly local-sports identity. Proposed styling: deep green, warm neutral backgrounds, and a bright lime accent, with readable typography and court imagery.

Design for mobile first, then expand grids and navigation for desktop. Include visible keyboard focus, labelled form fields, accessible contrast, useful empty states, and loading/error feedback. Cards should make location, time, and availability easy to scan.

## Code structure

```text
sportbuddy/
  README.md
  src/
    app/                       Next.js routes, layout, providers, global styles
    core/
      auth/                    Server-only Rebana token broker
      http/                    Browser transport and sandbox gateway
      location/                Location permission and distance helpers
    shared/
      models/                  Sports types and API reference types
      services/                Feature service interfaces and implementations
      components/              Navigation, cards, filters, forms, feedback
      data/                    Clearly identified sample data
    modules/sportbuddy/
      pages/                   Discovery, courts, games, community, connection
      store/                   Action, reducer, selector, effect, state
    store/                     Root store, typed hooks, listener setup
```

The store follows the blueprint's `*.action.ts`, `*.reducer.ts`, `*.selector.ts`, `*.effect.ts`, and `*.state.ts` layout. The prototype groups sports state in one module so switching demo identity, joining games, and making connections remain consistent. Components dispatch actions; reducers enforce interaction rules; a store-scoped listener persists changes through the demo service. Temporary forms and search filters stay local to their pages. The reference-data viewer maintains its own request status.

## Core data model

| Entity | Main fields |
| --- | --- |
| Sport | ID, name, icon identifier |
| Court | ID, name, address, area, coordinates, optional Google Place ID, sport IDs, facilities, hours, indicative pricing, images |
| Player | ID, display name, avatar, bio, area, preferred sports, skill levels |
| Game | ID, host ID, court ID, sport ID, title, description, start time, time zone, duration, capacity, optional contribution/currency, status |
| Game participant | Game ID, player ID, joined time; unique game/player pair |
| Connection | Requester ID, recipient ID, status, timestamps; prevent duplicate active relationships |
| Saved court | Player ID, court ID; unique player/court pair |

Store game timestamps in a consistent machine-readable format and display them in the venue's time zone. Calculate available spots from capacity and active participants instead of maintaining independent counts.

## Prototype versus live app

The prototype uses sample courts, games, and players, with a demo player and local browser persistence for interactions. Joining a sample game or sending a request does not contact a real person. Use the demo-player switch on `/profile` to demonstrate receiving and accepting requests. Profiles, memberships, requests, and saved courts survive reloads in the same browser. The demo is stored under `sportbuddy.demo.v1` in local storage; clearing this entry starts a fresh demo with new upcoming game dates.

Sample setting: Kuala Lumpur and nearby areas, with badminton, futsal, basketball, tennis, and pickleball. Venues, prices, coordinates, and people are examples, not a verified real-world directory. Game times display in Malaysia time (MYT).

A live release requires a chosen backend/database, real accounts, and a reliable court data source. Google Maps is the planned map provider; its Cloud project and restricted API key are setup dependencies for the built-in map. Backend and court data provider choices remain open. Service interfaces should let live adapters replace sample adapters without rebuilding the pages.

Before real multi-user use, enforce identity and ownership on the server, make game joins atomic so concurrent users cannot overfill a game, and add blocking/reporting and moderation handling. Browser storage is only for the prototype, not the authority for real membership or connections.

## Delivery status and next steps

- Implemented: responsive app shell, discovery, court filtering/details/saving, game filtering/details/hosting/editing/cancellation, joining/leaving, My games, community, connection requests, profile editing, and demo persistence.
- Implemented: Google Maps loader, venue pins and previews, List/Map toggle, search-this-area, external map/directions links, and missing-key/load-failure fallback. A real restricted key is still needed to validate live map rendering.
- Implemented: Rebana OAuth broker, allowlisted proxy, reference-data viewer, paging, and error/rate-limit handling. Live authenticated responses remain unverified without configured credentials; automated gateway tests use synthetic responses.
- Next live-service milestone: choose a sports database/backend, add real authentication and server-enforced ownership/capacity, source verified venues, add moderation, and prepare deployment.

## Acceptance checks for the prototype

- Users can select an area, discover courts, apply combined filters, and open court details.
- Device-location denial leaves manual location selection usable; no results produces a helpful empty state.
- With Google Maps configured, filtered court/game results match map pins; pin previews open the correct details, and “Search this area” updates the geographic results.
- Mobile List/Map switching preserves filters; a missing key or map-load failure leaves list browsing and external Google Maps links usable.
- Court and game directions links target the correct venue; game maps use their court's coordinates.
- Users can find an upcoming game, join once, see it in My games, leave, and observe the correct spot count.
- Full, cancelled, and past games cannot be joined, including through detail-page actions.
- A valid hosted game appears in listings; invalid input has clear field-level feedback.
- Users can view another player's profile and complete the connection request lifecycle using demo identities.
- Saved courts, profile edits, and demo participation survive a page refresh.
- Core flows work with keyboard navigation and on narrow mobile and desktop screens.
- Type checking and a production build pass; focused behavioral checks cover participation limits, host ownership, and connection transitions.

## Running the project

Tested with Node.js 24 on Windows. From this folder:

```powershell
npm install
npm run dev
```

Open [SportBuddy at localhost:3300](http://localhost:3300). The demo works without environment credentials.

To configure integrations, create a local environment file:

```powershell
Copy-Item .env.example .env.local
```

Set `SANDBOX_CLIENT_ID`, `SANDBOX_CLIENT_SECRET`, `SANDBOX_USERNAME`, and `SANDBOX_PASSWORD` using credentials issued by the council administrator. Leave `SANDBOX_BASE_URL` at the supplied Rebana endpoint unless using an authorized alternative. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for interactive maps. Restart development after changing configuration; rebuild production after changing the public Maps key. Never commit `.env.local`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server on port 3300 |
| `npm run typecheck` | TypeScript validation |
| `npm test` | Participation, ownership, connections, location helpers, and API gateway tests |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 3300 |
| `npm run test:e2e` | Browser journeys against a running app on port 3300 |

Browser checks use installed Microsoft Edge in headless mode. Run `npm run build` and `npm run start` before the browser suite. The default browser tests expect no integration keys; API paging/rate-limit tests intercept requests with fixtures. Screenshots are written to `artifacts/`.

The application uses CSS/SVG court illustrations and initials avatars, so the demo does not depend on image downloads. Fonts load from Google Fonts with system fallbacks.

## Verification

Completed on 7 September 2026:

- TypeScript validation and the production build pass.
- All 12 behavioral and API gateway tests pass.
- All 7 browser scenarios pass, covering court filtering/saving, game hosting/editing/joining/leaving/cancellation, profile and connection persistence, API boundary checks, paginated reference responses and retry feedback, denied geolocation, and mobile layout checks across nine routes.
- Desktop and mobile screenshots are available in [artifacts/](artifacts/).

Live authenticated Rebana requests and live Google Maps rendering still require credentials and are not represented as verified by these tests.
