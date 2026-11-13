# MyTune

**Sound, in your own key.**

MyTune is an independently designed, premium-feeling music player built with plain
**HTML, CSS and JavaScript** - no frameworks, no build step. It streams a curated
library of 15 **public-domain (CC0)** tracks from the Free Music Archive and wraps
them in an editorial, magazine-style interface with a distinct brand identity
(cream paper, deep teal ink, olive and amber accents).

---

## Features

- Play / pause, next / previous
- Seekable progress bar with live current time and total duration
- Volume control and mute
- Shuffle and repeat (off / all / one)
- Search across titles, artists, albums, genres and moods
- Favourite songs (saved in your browser)
- Create and manage playlists, add songs from anywhere
- Recently played history
- Click any song to play it - artwork and details update instantly
- Slide-in queue panel showing what is up next
- Full-screen "Now Playing" screen on mobile
- Everything runs on the native **HTML Audio API**

Favourites, playlists, history and settings are remembered between visits using
`localStorage`.

---

## Running the project

No installation is required.

1. Download or clone this repository.
2. Open `index.html` in any modern browser.

For the most accurate experience (and to avoid any local-file quirks) you can also
serve it with a tiny local server:

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

It also deploys to **GitHub Pages** as-is - just point Pages at the repository root.

---

## Project structure

```
MyTune/
├── index.html              # Page markup: header, sections, players, overlays
├── favicon.svg             # MyTune brand mark
├── css/
│   └── styles.css          # Design tokens, layout, components, responsive rules
├── js/
│   ├── data.js             # Track data, collections and credits
│   ├── storage.js          # localStorage helpers (favourites, playlists, ...)
│   ├── player.js           # Audio engine (playback, queue, shuffle, repeat)
│   ├── ui.js               # Drawing the page + wiring every control
│   └── app.js              # Bootstrap: starts the player and the UI
└── assets/
    ├── covers/             # 15 original SVG album covers
    └── music/              # 15 CC0 audio tracks (MP3)
```

### How it fits together

- **data.js** is the single source of truth for content. Add a song here and it
  appears everywhere (search, credits, collections).
- **player.js** is the only file that touches the `<audio>` element. It exposes a
  small API (`MyTune.Player`) and fires events (`play`, `pause`, `time`, ...).
- **ui.js** listens to those events and paints the screen. All buttons carry a
  `data-action` attribute, and one click listener routes them to the right function.
- **app.js** simply calls `Player.init()` and `UI.init()` once the page is ready.

---

## Music credits & license

All 15 tracks are dedicated to the **public domain** under the
[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) license and
were downloaded from the [Free Music Archive](https://freemusicarchive.org/). CC0
places the work in the public domain worldwide - you may copy, modify, distribute
and perform it, even commercially, without asking permission. No attribution is
legally required, but we credit every artist here with pleasure.

| # | Title | Artist | License | Source |
|---|-------|--------|---------|--------|
| 01 | West in Africa | John Bartmann | CC0 1.0 | [FMA](https://freemusicarchive.org/music/John_Bartmann/Public_Domain_Soundtrack_Music_Album_One/west-in-africa/) |
| 02 | Dreams | Beat Mekanik | CC0 1.0 | [FMA](https://freemusicarchive.org/music/beat-mekanik/single/dreams-free-stems/) |
| 03 | Path | Metre | CC0 1.0 | [FMA](https://freemusicarchive.org/music/Metre/conduit/path-1/) |
| 04 | La sirène de Yannek | Koi-discovery | CC0 1.0 | [FMA](https://freemusicarchive.org/music/koi-discovery/red-commander/la-sirene-de-yannekmp3/) |
| 05 | Waves of Longing | Ondrosik | CC0 1.0 | [FMA](https://freemusicarchive.org/music/Ondrosik/no-words/waves-of-longing/) |
| 06 | Stairwell Harmony | Amarent | CC0 1.0 | [FMA](https://freemusicarchive.org/music/amarent/public-domain/stairwell-harmony/) |
| 07 | Sax and Piano | Maarten Schellekens | CC0 1.0 | [FMA](https://freemusicarchive.org/music/maarten-schellekens/public-domain-1/sax-and-piano-free-track/) |
| 08 | Lamento | Mr Smith | CC0 1.0 | [FMA](https://freemusicarchive.org/music/mr-smith/hope-lights-the-horizon/lamento/) |
| 09 | Great Aunt Henrietta | TRG Banks | CC0 1.0 | [FMA](https://freemusicarchive.org/music/TRG_Banks/Dreamland/Great_Aunt_Henrietta/) |
| 10 | Aria (Goldberg Variations) | Kimiko Ishizaka | CC0 1.0 | [FMA](https://freemusicarchive.org/music/Kimiko_Ishizaka/The_Open_Goldberg_Variations/) |
| 11 | Sweetheart | HoliznaCC0 | CC0 1.0 | [FMA](https://freemusicarchive.org/music/holiznacc0/shooting-ghost-dirty-driving-death-part-2/sweetheart/) |
| 12 | I Need You | HoliznaCC0 | CC0 1.0 | [FMA](https://freemusicarchive.org/music/holiznacc0/be-happy-with-who-you-are/i-need-you/) |
| 13 | Eden | HoliznaCC0 | CC0 1.0 | [FMA](https://freemusicarchive.org/music/holiznacc0/mouth-music/eden/) |
| 14 | Engine Jim | HoliznaCC0 | CC0 1.0 | [FMA](https://freemusicarchive.org/music/holiznacc0/everything-hurts/engine-jim/) |
| 15 | No More Work | Bob A. Feldman | CC0 1.0 | [FMA](https://freemusicarchive.org/music/bob-a-feldman-19/single/no-more-work/) |

The album artwork in `assets/covers/` is **original to MyTune** - hand-authored SVG
compositions in the project's brand palette. No third-party images are used.

---

## Design notes

- **Palette:** cream `#F6EFE3`, deep teal `#0E3B3E`, olive `#7C7A3F`, amber `#D98E4A`.
- **Type:** *Fraunces* (expressive display serif) paired with *Manrope* (clean UI sans).
- **Layout:** asymmetric editorial grids, a rotating record in the hero, and
  non-uniform collection cards so no two areas look like the same template.
- **Mobile:** a genuinely separate experience - compact nav, a horizontal film-strip
  of recent songs, a mini player, and a full-screen Now Playing view.

This project is an original design. It does not copy the layout, branding or visual
identity of Spotify, Apple Music, YouTube Music or any other platform.

---

## License

The MyTune **code** in this repository is provided for learning and personal use.
The **music** is CC0 (public domain) as credited above.
