/* =============================================================
   MyTune - storage.js
   -------------------------------------------------------------
   Small helper around the browser's localStorage.

   localStorage lets us remember things between visits:
     - favourite songs
     - playlists the listener made
     - recently played songs
     - settings (volume, shuffle, repeat)

   Everything is stored as plain JSON text.
   ============================================================= */

window.MyTune = window.MyTune || {};

const Storage = {
  KEYS: {
    favourites: "mytune.favourites",
    playlists: "mytune.playlists",
    recents: "mytune.recents",
    settings: "mytune.settings"
  },

  /* Read a value. If it is missing or broken we return the fallback. */
  get: function (key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  },

  /* Write a value. If localStorage is unavailable we fail quietly. */
  set: function (key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* Private mode / storage full - ignore. */
    }
  },

  /* ---------------- Favourites ---------------- */
  getFavourites: function () {
    const list = this.get(this.KEYS.favourites, []);
    return Array.isArray(list) ? list : [];
  },

  isFavourite: function (trackId) {
    return this.getFavourites().indexOf(trackId) !== -1;
  },

  /* Add the track if it is missing, remove it if it is present.
     Returns true when the track is now a favourite. */
  toggleFavourite: function (trackId) {
    const favourites = this.getFavourites();
    const index = favourites.indexOf(trackId);
    let nowFavourite;
    if (index === -1) {
      favourites.unshift(trackId);
      nowFavourite = true;
    } else {
      favourites.splice(index, 1);
      nowFavourite = false;
    }
    this.set(this.KEYS.favourites, favourites);
    return nowFavourite;
  },

  /* ---------------- Playlists ---------------- */
  getPlaylists: function () {
    const list = this.get(this.KEYS.playlists, []);
    return Array.isArray(list) ? list : [];
  },

  savePlaylists: function (playlists) {
    this.set(this.KEYS.playlists, playlists);
  },

  createPlaylist: function (name) {
    const playlists = this.getPlaylists();
    const playlist = {
      id: "pl-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      name: name,
      tracks: []
    };
    playlists.push(playlist);
    this.savePlaylists(playlists);
    return playlist;
  },

  deletePlaylist: function (playlistId) {
    const playlists = this.getPlaylists().filter(function (playlist) {
      return playlist.id !== playlistId;
    });
    this.savePlaylists(playlists);
  },

  addTrackToPlaylist: function (playlistId, trackId) {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(function (item) {
      return item.id === playlistId;
    });
    if (!playlist) return false;
    if (playlist.tracks.indexOf(trackId) === -1) {
      playlist.tracks.push(trackId);
      this.savePlaylists(playlists);
    }
    return true;
  },

  removeTrackFromPlaylist: function (playlistId, trackId) {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(function (item) {
      return item.id === playlistId;
    });
    if (!playlist) return;
    playlist.tracks = playlist.tracks.filter(function (id) {
      return id !== trackId;
    });
    this.savePlaylists(playlists);
  },

  /* ---------------- Recently played ---------------- */
  getRecents: function () {
    const list = this.get(this.KEYS.recents, []);
    return Array.isArray(list) ? list : [];
  },

  /* Move the track to the front of the list and keep at most 12. */
  addRecent: function (trackId) {
    let recents = this.getRecents().filter(function (id) {
      return id !== trackId;
    });
    recents.unshift(trackId);
    recents = recents.slice(0, 12);
    this.set(this.KEYS.recents, recents);
  },

  /* ---------------- Settings ---------------- */
  getSettings: function () {
    const defaults = { volume: 0.8, shuffle: false, repeat: "off" };
    const saved = this.get(this.KEYS.settings, {});
    return Object.assign(defaults, saved);
  },

  saveSettings: function (settings) {
    this.set(this.KEYS.settings, settings);
  }
};

window.MyTune.Storage = Storage;
