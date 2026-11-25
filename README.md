# Luxe Nails Studio — fictional salon booking site

A self-directed portfolio piece by Khushi Khatri. **Luxe Nails Studio is an invented business — not a real client, not a real salon.** All copy, prices and imagery are fictional demo content.

## What it is
A polished, responsive multi-page booking site for a fictional nail studio:
- `index.html` — home / hero / about / signature services
- `services.html` — service cards + full pricing table
- `gallery.html` — work gallery (9 images)
- `booking.html` — booking form (service, date, time slot, name, phone)

## Stack
- HTML5, CSS3, vanilla JavaScript
- Bootstrap 5 (CDN)
- Google Fonts: Playfair Display + Inter
- Images: `picsum.photos` seeded placeholder URLs
- Backend: plain dependency-free PHP (`booking.php`) — no frameworks, no database, no Composer

## Backend
`booking.php` accepts a JSON POST, validates service / date / time / name / phone, and appends the booking to `data/bookings.json`, returning a JSON confirmation with a reference number (e.g. `LX-3F9A1C`).

**The PHP runs on a PHP host, not on GitHub Pages.** GitHub Pages is static-only and cannot execute PHP. To use the real backend, upload this folder to any cheap shared PHP host (or run `php -S localhost:8000` locally) — the form then posts to `booking.php` and returns a real confirmation.

## How to run locally
Static demo (no backend — form shows a clearly-labelled demo state):
```bash
cd luxe-nails-studio
python3 -m http.server 8000
# open http://localhost:8000/
```

With the real PHP backend:
```bash
php -S localhost:8000
# open http://localhost:8000/booking.html and submit the form
```

## Demo mode
When no backend is present (static hosting or `file://`), submitting the booking form shows a clearly-labelled **"Demo mode — no backend connected"** message. Nothing is faked: no booking is recorded and no confirmation is pretended.
