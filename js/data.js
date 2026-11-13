/* =============================================================
   MyTune - data.js
   -------------------------------------------------------------
   This file holds all the *content* of the app: the songs,
   the curated collections (moods) and the music credits.

   Every song here is released under the CC0 1.0 "Public Domain
   Dedication" license on the Free Music Archive (FMA). CC0 means
   the artist has given the track away with no restrictions, so it
   is safe to host and play from a public GitHub repository.

   The audio files live in  assets/music/  and the artwork in
   assets/covers/  - both are part of this project.
   ============================================================= */

/* A reusable license description so we do not repeat ourselves. */
const CC0 = {
  name: "CC0 1.0 Universal (Public Domain)",
  url: "https://creativecommons.org/publicdomain/zero/1.0/",
  source: "Free Music Archive",
  sourceUrl: "https://freemusicarchive.org/"
};

/* -------------------------------------------------------------
   TRACKS
   Each object is one song. `duration` is in SECONDS (used as a
   fallback until the real audio metadata loads).
   ------------------------------------------------------------- */
const TRACKS = [
  {
    id: "west-in-africa",
    title: "West in Africa",
    artist: "John Bartmann",
    album: "Public Domain Soundtrack Music: Album One",
    year: 2018,
    genre: "Afrobeat · Cinematic",
    mood: "Golden Hour",
    tags: ["Instrumental", "Warm", "World"],
    cover: "assets/covers/west-in-africa.svg",
    src: "assets/music/west-in-africa.mp3",
    duration: 174,
    page: "https://freemusicarchive.org/music/John_Bartmann/Public_Domain_Soundtrack_Music_Album_One/west-in-africa/",
    license: CC0
  },
  {
    id: "dreams",
    title: "Dreams",
    artist: "Beat Mekanik",
    album: "Single",
    year: 2024,
    genre: "Synth Pop",
    mood: "Deep Focus",
    tags: ["Instrumental", "Synth", "Night"],
    cover: "assets/covers/dreams.svg",
    src: "assets/music/dreams.mp3",
    duration: 237,
    page: "https://freemusicarchive.org/music/beat-mekanik/single/dreams-free-stems/",
    license: CC0
  },
  {
    id: "path",
    title: "Path",
    artist: "Metre",
    album: "Conduit",
    year: 2023,
    genre: "Electronic · Dance",
    mood: "Deep Focus",
    tags: ["Instrumental", "Beats", "Focus"],
    cover: "assets/covers/path.svg",
    src: "assets/music/path.mp3",
    duration: 296,
    page: "https://freemusicarchive.org/music/Metre/conduit/path-1/",
    license: CC0
  },
  {
    id: "la-sirene-de-yannek",
    title: "La sirène de Yannek",
    artist: "Koi-discovery",
    album: "Red Commander",
    year: 2024,
    genre: "Post-rock · Lo-fi",
    mood: "Deep Focus",
    tags: ["Instrumental", "Lo-fi", "Ambient"],
    cover: "assets/covers/la-sirene-de-yannek.svg",
    src: "assets/music/la-sirene-de-yannek.mp3",
    duration: 305,
    page: "https://freemusicarchive.org/music/koi-discovery/red-commander/la-sirene-de-yannekmp3/",
    license: CC0
  },
  {
    id: "waves-of-longing",
    title: "Waves of Longing",
    artist: "Ondrosik",
    album: "No words",
    year: 2026,
    genre: "Neoclassical · Electronic",
    mood: "Deep Focus",
    tags: ["Instrumental", "Cinematic", "Calm"],
    cover: "assets/covers/waves-of-longing.svg",
    src: "assets/music/waves-of-longing.mp3",
    duration: 229,
    page: "https://freemusicarchive.org/music/Ondrosik/no-words/waves-of-longing/",
    license: CC0
  },
  {
    id: "stairwell-harmony",
    title: "Stairwell Harmony",
    artist: "Amarent",
    album: "Public Domain",
    year: 2026,
    genre: "Ambient",
    mood: "Slow Morning",
    tags: ["Instrumental", "Ambient", "Calm"],
    cover: "assets/covers/stairwell-harmony.svg",
    src: "assets/music/stairwell-harmony.mp3",
    duration: 120,
    page: "https://freemusicarchive.org/music/amarent/public-domain/stairwell-harmony/",
    license: CC0
  },
  {
    id: "sax-and-piano",
    title: "Sax and Piano",
    artist: "Maarten Schellekens",
    album: "Public Domain",
    year: 2025,
    genre: "Jazz · Easy Listening",
    mood: "Slow Morning",
    tags: ["Instrumental", "Jazz", "Morning"],
    cover: "assets/covers/sax-and-piano.svg",
    src: "assets/music/sax-and-piano.mp3",
    duration: 94,
    page: "https://freemusicarchive.org/music/maarten-schellekens/public-domain-1/sax-and-piano-free-track/",
    license: CC0
  },
  {
    id: "lamento",
    title: "Lamento",
    artist: "Mr Smith",
    album: "Hope Lights The Horizon",
    year: 2021,
    genre: "Acoustic · Soundtrack",
    mood: "After Hours",
    tags: ["Instrumental", "Strings", "Sad"],
    cover: "assets/covers/lamento.svg",
    src: "assets/music/lamento.mp3",
    duration: 68,
    page: "https://freemusicarchive.org/music/mr-smith/hope-lights-the-horizon/lamento/",
    license: CC0
  },
  {
    id: "great-aunt-henrietta",
    title: "Great Aunt Henrietta",
    artist: "TRG Banks",
    album: "Dreamland",
    year: 2018,
    genre: "Piano · Ambient",
    mood: "Slow Morning",
    tags: ["Instrumental", "Piano", "Gentle"],
    cover: "assets/covers/great-aunt-henrietta.svg",
    src: "assets/music/great-aunt-henrietta.mp3",
    duration: 269,
    page: "https://freemusicarchive.org/music/TRG_Banks/Dreamland/Great_Aunt_Henrietta/",
    license: CC0
  },
  {
    id: "aria",
    title: "Aria (Goldberg Variations)",
    artist: "Kimiko Ishizaka",
    album: "The Open Goldberg Variations",
    year: 2012,
    genre: "Classical",
    mood: "Slow Morning",
    tags: ["Instrumental", "Classical", "Piano"],
    cover: "assets/covers/aria.svg",
    src: "assets/music/aria.mp3",
    duration: 299,
    page: "https://freemusicarchive.org/music/Kimiko_Ishizaka/The_Open_Goldberg_Variations/KIMIKO_ISHIZAKA_-_Goldberg_Variations_BWV_988_-_01_-_Aria__44k-24b/",
    license: CC0
  },
  {
    id: "sweetheart",
    title: "Sweetheart",
    artist: "HoliznaCC0",
    album: "Shooting Ghost, Part 2",
    year: 2022,
    genre: "Folk · Country",
    mood: "Golden Hour",
    tags: ["Vocal", "Acoustic", "Warm"],
    cover: "assets/covers/sweetheart.svg",
    src: "assets/music/sweetheart.mp3",
    duration: 183,
    page: "https://freemusicarchive.org/music/holiznacc0/shooting-ghost-dirty-driving-death-part-2/sweetheart/",
    license: CC0
  },
  {
    id: "i-need-you",
    title: "I Need You",
    artist: "HoliznaCC0",
    album: "Be Happy With Who You Are",
    year: 2023,
    genre: "Soul · R&B",
    mood: "Golden Hour",
    tags: ["Vocal", "Soul", "Groove"],
    cover: "assets/covers/i-need-you.svg",
    src: "assets/music/i-need-you.mp3",
    duration: 205,
    page: "https://freemusicarchive.org/music/holiznacc0/be-happy-with-who-you-are/i-need-you/",
    license: CC0
  },
  {
    id: "eden",
    title: "Eden",
    artist: "HoliznaCC0",
    album: "Mouth Music",
    year: 2015,
    genre: "Acapella",
    mood: "After Hours",
    tags: ["Vocal", "Acapella", "Intimate"],
    cover: "assets/covers/eden.svg",
    src: "assets/music/eden.mp3",
    duration: 391,
    page: "https://freemusicarchive.org/music/holiznacc0/mouth-music/eden/",
    license: CC0
  },
  {
    id: "engine-jim",
    title: "Engine Jim",
    artist: "HoliznaCC0",
    album: "Everything Hurts",
    year: 2023,
    genre: "Blues · Rock",
    mood: "After Hours",
    tags: ["Vocal", "Blues", "Gritty"],
    cover: "assets/covers/engine-jim.svg",
    src: "assets/music/engine-jim.mp3",
    duration: 357,
    page: "https://freemusicarchive.org/music/holiznacc0/everything-hurts/engine-jim/",
    license: CC0
  },
  {
    id: "no-more-work",
    title: "No More Work",
    artist: "Bob A. Feldman",
    album: "Single",
    year: 2026,
    genre: "Folk · Protest",
    mood: "Golden Hour",
    tags: ["Vocal", "Folk", "Story"],
    cover: "assets/covers/no-more-work.svg",
    src: "assets/music/no-more-work.mp3",
    duration: 284,
    page: "https://freemusicarchive.org/music/bob-a-feldman-19/single/no-more-work/",
    license: CC0
  }
];

/* -------------------------------------------------------------
   COLLECTIONS (the "moods" shown on the home page)
   `tracks` is a list of track ids.
   ------------------------------------------------------------- */
const COLLECTIONS = [
  {
    id: "slow-morning",
    name: "Slow Morning",
    blurb: "Soft piano and a warm cup of nothing to do.",
    accent: "cream",
    tracks: ["stairwell-harmony", "great-aunt-henrietta", "sax-and-piano", "aria"]
  },
  {
    id: "deep-focus",
    name: "Deep Focus",
    blurb: "Steady beats for long stretches of work.",
    accent: "teal",
    tracks: ["path", "waves-of-longing", "dreams", "la-sirene-de-yannek"]
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    blurb: "Sun-warmed folk, soul and stories.",
    accent: "amber",
    tracks: ["west-in-africa", "sweetheart", "i-need-you", "no-more-work"]
  },
  {
    id: "after-hours",
    name: "After Hours",
    blurb: "Low light, big feelings, honest voices.",
    accent: "olive",
    tracks: ["eden", "engine-jim", "lamento", "great-aunt-henrietta"]
  }
];

/* -------------------------------------------------------------
   A small helper so other files can look a track up by its id.
   ------------------------------------------------------------- */
function getTrackById(id) {
  return TRACKS.find(function (track) {
    return track.id === id;
  });
}

/* Expose the data on a global MyTune object so the other scripts
   (player.js, ui.js, app.js) can use it. We use classic scripts
   instead of modules so the site also works when you open
   index.html directly from your computer (file://). */
window.MyTune = window.MyTune || {};
window.MyTune.TRACKS = TRACKS;
window.MyTune.COLLECTIONS = COLLECTIONS;
window.MyTune.getTrackById = getTrackById;
