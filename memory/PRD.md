# Lukas & Laura's Familien-Reisetagebuch - PRD

## Original Problem Statement
Reise Seite für Lukas, Laura und ihren 3 Kindern - Eine Familien-Reise-Website mit Google Maps Integration.

## User Personas
- **Lukas & Laura**: Eltern, die Familienreisen planen und dokumentieren möchten
- **3 Kinder**: Teil der Familie, die auf Reisen gehen

## Core Requirements (Static)
- Interaktive Google Maps Karte mit Reisezielen
- Foto-Galerien für Reisen
- Reise-Timeline/Kalender
- Packlisten für Familienreisen
- Familienmitglieder-Profile

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Maps**: Google Maps API (@react-google-maps/api)
- **Fonts**: Fraunces (Headings) + Nunito Sans (Body)

## What's Been Implemented (2026-02-14)
- ✅ Hero Landing Page mit Lukas & Laura's Familien-Reisetagebuch
- ✅ Floating Pill Navigation (Start, Karte, Reisen, Packlisten, Familie)
- ✅ Google Maps Integration mit Custom Styling
- ✅ Trips CRUD (Erstellen, Bearbeiten, Löschen, Filtern)
- ✅ Packing Lists mit Kategorien (Kleidung, Elektronik, Kinder, etc.)
- ✅ Family Profiles mit Emoji-Avataren und Farben
- ✅ 5 Standard-Familienmitglieder initialisiert (Lukas, Laura, 3 Kinder)
- ✅ Responsive Design mit Framer Motion Animationen
- ✅ Calendar/Date Picker für Reisedaten

## API Endpoints
- GET/POST /api/trips - Reiseverwaltung
- GET/POST /api/family - Familienmitglieder
- GET/POST /api/packing-lists - Packlisten
- PATCH /api/packing-lists/{id}/items/{item_id}/toggle - Item abhaken

## Prioritized Backlog
### P0 (Done)
- [x] Core CRUD für alle Entitäten
- [x] Google Maps Integration

### P1 (Next)
- [ ] Foto-Upload für Reisen
- [ ] Teilen von Reiseberichten
- [ ] Export als PDF

### P2 (Future)
- [ ] Mobile App
- [ ] Offline-Modus
- [ ] KI-gestützte Reisevorschläge

## Next Tasks
1. Namen der 3 Kinder vom Benutzer erfragen und aktualisieren
2. Foto-Upload Feature hinzufügen
3. Reiseberichte als PDF exportieren
