# MyTune

**Sound, in your own key.**

A small music player built with plain **HTML, CSS and JavaScript** - no frameworks and no build step. It includes five **CC0 public-domain** songs and a single JavaScript file for all logic.

## Features

- Play / pause, previous / next
- Seek bar with live time
- Volume and mute
- Shuffle and repeat (off / all / one)
- Search by song, artist, album, genre or mood
- Favourites, playlists and recently played (saved in `localStorage`)
- Queue panel and full-screen now playing on mobile

## Run it

Open `index.html` in any modern browser. No installation needed.

## Structure

```
MyTune/
├── index.html
├── favicon.svg
├── styles.css
├── app.js
└── assets/
    ├── covers/   (5 SVG covers)
    └── music/    (5 MP3 tracks)
```

All data, storage, playback and interface code live in `app.js`, grouped into clear sections.

## Songs

| Title | Artist |
|-------|--------|
| West in Africa | John Bartmann |
| Sweetheart | HoliznaCC0 |
| Dreams | Beat Mekanik |
| Sax and Piano | Maarten Schellekens |
| Eden | HoliznaCC0 |

All songs are **CC0 1.0 public domain**, sourced from the [Free Music Archive](https://freemusicarchive.org/). The artwork in `assets/covers/` is original to MyTune.

---

© 2026 MyTune. Code provided for learning and personal use.
