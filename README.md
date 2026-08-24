# Vidushi's Birthday — BIRTHDAY.EXE

An interactive, single-purpose birthday site. Pure vanilla HTML/CSS/JS — no build step, no dependencies, works by just opening `index.html` in any modern browser (double-click is fine; a local server also works).

## What's inside

- `index.html` — the whole page structure
- `css/style.css` — all styling (self-contained, no imports)
- `js/main.js` — all logic + personalization data

## Interactive features

- Boot loader with 3·2·1 countdown and confetti cannons
- Floating balloons you can **pop** (with sound)
- A cake with candles you **blow out** → fireworks + a synthesized *Happy Birthday* tune (Web Audio API, no audio files needed)
- Confetti burst on every click/tap
- Polaroid memory cards with 3D tilt and a lightbox
- Animated personality stats, awards grid
- Sealed envelope letter that opens
- Gift box finale with a firework show
- Custom cursor with sparkle trail, magnetic buttons
- Easter egg: type her name anywhere

## Personalize

Everything editable lives at the top of `js/main.js` in the `CONFIG` object:

- `name` and `secretWord` (easter egg trigger)
- `photos` — emoji, caption and detail for each memory card (swap emojis for `<img>` tags if you want real photos)
- `stats`, `awards`, letter text (in `index.html`)
