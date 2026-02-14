# Lukas & Laura's Familien-Reisetagebuch - PRD

## Original Problem Statement
Private Reise-Website fur die Familie Dahrendorf (Lukas, Laura und ihre drei Sohne: Louie, Levi und Noah). Hauptreise: "USA Westkuste 2026" - 26-tagiger Roadtrip von Las Vegas nach Seattle.

## User Personas
- **Lukas & Laura**: Eltern, planen Familienreisen
- **Louie, Levi, Noah**: Die drei Sohne
- **Alex**: Freund/Bekannter, gibt Reise-Tipps

## Core Requirements
1. Detaillierte Reiseroute "USA Westkuste 2026" als zusammenhangende Reise
2. Optionale Vorschlage (Tipps): Mt. St. Helens, Leavenworth, Yellowstone - hinzufugbar
3. Bilder fur Vorschlage (vom Benutzer bereitgestellt)
4. Google Maps mit Routenfuhrung (echte Fahrtroute, nicht nur Marker)
5. KI-Reise-Assistent (Claude/Anthropic)
6. Familienmitglieder-Seite
7. Packlisten
8. Mobile-optimiert (iPhone)

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor async)
- **Maps**: Google Maps API (@react-google-maps/api) mit DirectionsRenderer
- **AI Chat**: Anthropic Claude via emergentintegrations
- **Fonts**: Fraunces (Headings) + Nunito Sans (Body)

## What's Been Implemented (2026-02-14)

### Navigation & Structure (COMPLETE)
- Bottom tab bar navigation on mobile (iPhone-style)
- Floating pill navigation on desktop
- 5 pages: Start, Route, Planen, Packen, Familie

### Start Page (COMPLETE)
- Hero section with Las Vegas background, countdown to departure
- Quick stats: 26 Tage, 9 Stopps, Tipps count, Family members
- Family avatars preview
- Quick links to other sections

### Route Page (COMPLETE)
- Google Maps with DirectionsRenderer (actual driving route)
- 9 numbered main stops with colored markers
- 3 optional Alex-Tipps markers (toggleable)
- Total distance and duration display
- Reiseverlauf list with dates and day numbers
- Click stop to pan map

### Planen Page (COMPLETE)
- Two tabs: Reiseplan and Tipps
- Reiseplan: Timeline with 10 itinerary items, day numbers, dates
- Tipps: 3 suggestion cards with WORKING images (Mt. St. Helens, Leavenworth, Yellowstone)
- Toggle add/remove suggestions from trip
- Expandable highlights for each suggestion

### Packen Page (COMPLETE)
- Packing lists with categories (Kleidung, Elektronik, Dokumente, etc.)
- Toggle items checked/unchecked
- Add new items with category selection
- Progress indicator
- Create new lists

### Familie Page (COMPLETE)
- 5 family members: Lukas, Laura (parents), Louie, Levi, Noah (children)
- Emoji avatars with colors
- Add/edit/delete members

### KI Chat (COMPLETE)
- Floating chat widget on all pages
- Claude-powered travel assistant
- Session-based conversation history
- Positioned above bottom nav on mobile

### Backend (COMPLETE)
- init_db on startup populates all seed data
- API endpoints: /api/trips, /api/suggestions, /api/family, /api/packing-lists, /api/chat
- MongoDB with Motor async driver

## API Endpoints
- GET/POST /api/trips
- GET /api/suggestions
- PATCH /api/suggestions/{id}/toggle
- GET/POST /api/family
- DELETE /api/family/{id}
- GET/POST /api/packing-lists
- PUT /api/packing-lists/{id}
- PATCH /api/packing-lists/{id}/items/{item_id}/toggle
- POST /api/chat
- GET /api/chat/history/{session_id}

## Testing Status
- Backend: 100% (9/9 tests passed)
- Frontend: 100% (all pages functional)
- Suggestion images: All 3 visible and loading
- Test report: /app/test_reports/iteration_2.json

## Prioritized Backlog

### P0 (Done)
- [x] Core CRUD fur alle Entitaten
- [x] Google Maps Integration mit Routenfuhrung
- [x] Navigation-Uberarbeitung (Bottom Tab Bar Mobile)
- [x] Suggestion-Bilder repariert
- [x] Mobile Optimierung
- [x] KI-Chat Integration

### P1 (Next)
- [ ] Foto-Upload fur Reisen
- [ ] Versionsverlauf fur Reisen

### P2 (Future)
- [ ] Export als PDF
- [ ] Offline-Modus
- [ ] Teilen von Reiseberichten
