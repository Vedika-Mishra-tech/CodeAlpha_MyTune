/* =============================================================
   MyTune - single-file app
   Sections: 1. Data  2. Storage  3. Player  4. Interface  5. Start
   ============================================================= */

(function () {
  "use strict";

  /* ---------- 1. DATA ---------- */

  const LICENSE = "CC0";

  const TRACKS = [
    {
      id: "west-in-africa",
      title: "West in Africa",
      artist: "John Bartmann",
      album: "Public Domain Soundtrack Music",
      year: 2018,
      genre: "Afrobeat · Cinematic",
      mood: "Golden Hour",
      tags: ["Instrumental", "Warm", "World"],
      cover: "assets/covers/west-in-africa.svg",
      src: "assets/music/west-in-africa.mp3",
      duration: 174
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
      duration: 183
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
      duration: 237
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
      duration: 94
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
      duration: 391
    }
  ];

  const COLLECTIONS = [
    {
      id: "golden-hour",
      name: "Golden Hour",
      tracks: ["west-in-africa", "sweetheart"]
    },
    {
      id: "deep-focus",
      name: "Deep Focus",
      tracks: ["dreams"]
    },
    {
      id: "slow-morning",
      name: "Slow Morning",
      tracks: ["sax-and-piano"]
    },
    {
      id: "after-hours",
      name: "After Hours",
      tracks: ["eden"]
    }
  ];

  const TRACK_MAP = new Map(TRACKS.map(function (track) {
    return [track.id, track];
  }));

  function getTrackById(id) {
    return TRACK_MAP.get(id);
  }

  /* ---------- 2. STORAGE ---------- */

  const Storage = (function () {
    const KEYS = {
      favourites: "mytune.favourites",
      playlists: "mytune.playlists",
      recents: "mytune.recents",
      settings: "mytune.settings"
    };

    const RECENT_LIMIT = 12;
    const DEFAULT_SETTINGS = { volume: 0.8, shuffle: false, repeat: "off" };

    function read(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch (error) {
        return fallback;
      }
    }

    function write(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        /* Storage may be disabled or full. Ignore quietly. */
      }
    }

    function getFavourites() {
      const list = read(KEYS.favourites, []);
      return Array.isArray(list) ? list : [];
    }

    function getPlaylists() {
      const list = read(KEYS.playlists, []);
      return Array.isArray(list) ? list : [];
    }

    function getRecents() {
      const list = read(KEYS.recents, []);
      return Array.isArray(list) ? list : [];
    }

    return {
      getFavourites: getFavourites,
      getPlaylists: getPlaylists,
      getRecents: getRecents,

      getSettings: function () {
        return Object.assign({}, DEFAULT_SETTINGS, read(KEYS.settings, {}));
      },

      isFavourite: function (trackId) {
        return getFavourites().indexOf(trackId) !== -1;
      },

      toggleFavourite: function (trackId) {
        const favourites = getFavourites();
        const index = favourites.indexOf(trackId);
        const saved = index === -1;

        if (saved) favourites.unshift(trackId);
        else favourites.splice(index, 1);

        write(KEYS.favourites, favourites);
        return saved;
      },

      createPlaylist: function (name) {
        const playlists = getPlaylists();
        const playlist = {
          id: "pl-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
          name: name,
          tracks: []
        };
        playlists.push(playlist);
        write(KEYS.playlists, playlists);
        return playlist;
      },

      deletePlaylist: function (playlistId) {
        const playlists = getPlaylists().filter(function (playlist) {
          return playlist.id !== playlistId;
        });
        write(KEYS.playlists, playlists);
      },

      addTrackToPlaylist: function (playlistId, trackId) {
        const playlists = getPlaylists();
        const playlist = playlists.find(function (item) {
          return item.id === playlistId;
        });
        if (!playlist) return false;

        if (playlist.tracks.indexOf(trackId) === -1) {
          playlist.tracks.push(trackId);
          write(KEYS.playlists, playlists);
        }
        return true;
      },

      addRecent: function (trackId) {
        const recents = getRecents().filter(function (id) {
          return id !== trackId;
        });
        recents.unshift(trackId);
        write(KEYS.recents, recents.slice(0, RECENT_LIMIT));
      },

      saveSettings: function (settings) {
        write(KEYS.settings, settings);
      }
    };
  })();

  /* ---------- 3. PLAYER ---------- */

  const Player = (function () {
    const audio = new Audio();
    audio.preload = "metadata";

    const listeners = {};
    let queue = [];
    let currentIndex = -1;
    let shuffleOn = false;
    let repeatMode = "off";

    function on(eventName, handler) {
      (listeners[eventName] = listeners[eventName] || []).push(handler);
    }

    function emit(eventName, payload) {
      (listeners[eventName] || []).forEach(function (handler) {
        handler(payload);
      });
    }

    function getCurrentTrack() {
      return queue[currentIndex] ? getTrackById(queue[currentIndex]) : null;
    }

    function loadTrack(trackId, autoplay) {
      const track = getTrackById(trackId);
      if (!track) return;

      audio.src = track.src;
      emit("trackchange", track);

      if (autoplay) play();
      else emit("pause", track);
    }

    function play() {
      const promise = audio.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          emit("pause", getCurrentTrack());
        });
      }
    }

    function pause() {
      audio.pause();
    }

    function toggle() {
      if (audio.paused) play();
      else pause();
    }

    function playContext(ids, startIndex) {
      if (!ids || !ids.length) return;

      queue = ids.slice();
      currentIndex = startIndex || 0;
      loadTrack(queue[currentIndex], true);
      emit("queuechange", queue.slice());
    }

    function playTrack(trackId) {
      const index = queue.indexOf(trackId);
      if (index !== -1) {
        currentIndex = index;
        loadTrack(trackId, true);
      } else {
        playContext([trackId], 0);
      }
    }

    function next(manual) {
      if (!queue.length) return;

      if (repeatMode === "one" && !manual) {
        audio.currentTime = 0;
        play();
        return;
      }

      let nextIndex;
      if (shuffleOn && queue.length > 1) {
        do {
          nextIndex = Math.floor(Math.random() * queue.length);
        } while (nextIndex === currentIndex);
      } else {
        nextIndex = currentIndex + 1;
      }

      if (nextIndex >= queue.length) {
        if (repeatMode === "all" || manual) {
          nextIndex = 0;
        } else {
          pause();
          audio.currentTime = 0;
          emit("pause", getCurrentTrack());
          return;
        }
      }

      currentIndex = nextIndex;
      loadTrack(queue[currentIndex], true);
    }

    function prev() {
      if (!queue.length) return;

      if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
      }

      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = shuffleOn ? Math.floor(Math.random() * queue.length) : queue.length - 1;
      }

      currentIndex = prevIndex;
      loadTrack(queue[currentIndex], true);
    }

    function seek(seconds) {
      if (isFinite(seconds)) audio.currentTime = seconds;
    }

    function setVolume(value) {
      const volume = Math.max(0, Math.min(1, value));
      audio.volume = volume;
      audio.muted = false;
      saveSettings();
      emit("volumechange", volume);
    }

    function getVolume() {
      return audio.muted ? 0 : audio.volume;
    }

    function toggleMute() {
      audio.muted = !audio.muted;
      emit("volumechange", getVolume());
    }

    function setShuffle(value) {
      shuffleOn = Boolean(value);
      saveSettings();
      emit("modechange", { shuffle: shuffleOn, repeat: repeatMode });
    }

    function cycleRepeat() {
      const modes = ["off", "all", "one"];
      repeatMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
      saveSettings();
      emit("modechange", { shuffle: shuffleOn, repeat: repeatMode });
    }

    function saveSettings() {
      Storage.saveSettings({
        volume: audio.volume,
        shuffle: shuffleOn,
        repeat: repeatMode
      });
    }

    audio.addEventListener("play", function () {
      emit("play", getCurrentTrack());
    });

    audio.addEventListener("pause", function () {
      emit("pause", getCurrentTrack());
    });

    audio.addEventListener("timeupdate", function () {
      emit("time", { current: audio.currentTime, duration: audio.duration });
    });

    audio.addEventListener("loadedmetadata", function () {
      emit("loadedmetadata", { current: audio.currentTime, duration: audio.duration });
    });

    audio.addEventListener("ended", function () {
      next(false);
    });

    audio.addEventListener("error", function () {
      emit("error", getCurrentTrack());
    });

    return {
      init: function () {
        const settings = Storage.getSettings();
        audio.volume = typeof settings.volume === "number" ? settings.volume : 0.8;
        shuffleOn = Boolean(settings.shuffle);
        repeatMode = settings.repeat || "off";
      },
      on: on,
      play: play,
      pause: pause,
      toggle: toggle,
      playTrack: playTrack,
      playContext: playContext,
      next: next,
      prev: prev,
      seek: seek,
      setVolume: setVolume,
      getVolume: getVolume,
      toggleMute: toggleMute,
      toggleShuffle: function () { setShuffle(!shuffleOn); },
      setShuffle: setShuffle,
      cycleRepeat: cycleRepeat,
      getCurrentTrack: getCurrentTrack,
      getQueue: function () { return queue.slice(); },
      isShuffle: function () { return shuffleOn; },
      getRepeat: function () { return repeatMode; }
    };
  })();

  /* ---------- 4. INTERFACE ---------- */

  const UI = (function () {
    const $ = function (selector) { return document.querySelector(selector); };
    const $$ = function (selector) { return Array.from(document.querySelectorAll(selector)); };

    const HERO_TRACK_ID = TRACKS[0].id;
    const TOAST_MS = 2600;
    const MENU_WIDTH = 240;

    let openPlaylistId = null;
    let seeking = false;
    let toastTimer = null;

    function formatTime(seconds) {
      if (!isFinite(seconds) || seconds < 0) return "0:00";
      const total = Math.floor(seconds);
      return Math.floor(total / 60) + ":" + String(total % 60).padStart(2, "0");
    }

    function escapeHtml(text) {
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function pad(number) {
      return String(number).padStart(2, "0");
    }

    function searchTracks(query) {
      const term = query.trim().toLowerCase();
      if (!term) return [];

      return TRACKS.filter(function (track) {
        const haystack = [track.title, track.artist, track.album, track.genre, track.mood]
          .concat(track.tags || [])
          .join(" ")
          .toLowerCase();
        return haystack.indexOf(term) !== -1;
      }).map(function (track) { return track.id; });
    }

    /* ---------- track rows ---------- */

    function trackRow(track, listKey) {
      const favourite = Storage.isFavourite(track.id);
      const current = Player.getCurrentTrack();
      const playing = current && current.id === track.id;

      const tags = (track.tags || []).slice(0, 2).map(function (tag) {
        return '<span class="track__tag">' + escapeHtml(tag) + "</span>";
      }).join("");

      const indexIcon = playing
        ? '<span class="eq" aria-hidden="true"><span></span><span></span><span></span></span>'
        : '<svg class="icon" aria-hidden="true"><use href="#icon-play"></use></svg>';

      return (
        '<li class="track' + (playing ? " is-playing" : "") + '" data-id="' + track.id + '" data-list="' + listKey + '">' +
          '<button class="track__index" data-action="play-track" data-id="' + track.id + '" data-list="' + listKey + '" aria-label="Play ' + escapeHtml(track.title) + '">' +
            indexIcon +
          "</button>" +
          '<img class="track__cover" src="' + track.cover + '" alt="" loading="lazy" width="54" height="54" />' +
          '<div class="track__main">' +
            '<span class="track__title">' + escapeHtml(track.title) + "</span>" +
            '<span class="track__artist">' + escapeHtml(track.artist) + "</span>" +
          "</div>" +
          '<div class="track__tags">' + tags + "</div>" +
          '<span class="track__duration">' + formatTime(track.duration) + "</span>" +
          '<div class="track__actions">' +
            '<button class="icon-btn' + (favourite ? " is-active" : "") + '" data-action="toggle-fav" data-id="' + track.id + '" aria-label="Toggle favourite" aria-pressed="' + favourite + '">' +
              '<svg class="icon" aria-hidden="true"><use href="#icon-heart' + (favourite ? "-filled" : "") + '"></use></svg>' +
            "</button>" +
            '<button class="icon-btn" data-action="add-to-playlist" data-id="' + track.id + '" aria-label="Add to playlist">' +
              '<svg class="icon" aria-hidden="true"><use href="#icon-plus"></use></svg>' +
            "</button>" +
          "</div>" +
        "</li>"
      );
    }

    function renderTrackList(container, ids, listKey) {
      if (!container) return;

      container.innerHTML = ids.map(function (id) {
        const track = getTrackById(id);
        return track ? trackRow(track, listKey) : "";
      }).join("");
    }

    /* ---------- sections ---------- */

    function renderHero() {
      const track = getTrackById(HERO_TRACK_ID);

      $("#estYear").textContent = new Date().getFullYear();
      $("#heroCover").src = track.cover;
      $("#heroTitle").textContent = track.title;
      $("#heroArtist").textContent = track.artist;
      $("#heroIndex").textContent = pad(TRACKS.indexOf(track) + 1);
    }

    function renderStats() {
      $("#statTracks").textContent = TRACKS.length;
      $("#statMoods").textContent = COLLECTIONS.length;
      $("#statLicense").textContent = LICENSE;
      $("#footerYear").textContent = new Date().getFullYear();
    }

    function renderSongs() {
      const current = Player.getCurrentTrack();

      $("#songsGrid").innerHTML = TRACKS.map(function (track) {
        const playing = current && current.id === track.id;
        const favourite = Storage.isFavourite(track.id);

        return (
          '<article class="song-card' + (playing ? " is-playing" : "") + '" data-action="play-song" data-id="' + track.id + '">' +
            '<div class="song-card__art">' +
              '<img src="' + track.cover + '" alt="" loading="lazy" />' +
              '<button class="song-card__play" data-action="play-song" data-id="' + track.id + '" aria-label="Play ' + escapeHtml(track.title) + '">' +
                '<svg class="icon" aria-hidden="true"><use href="#icon-play"></use></svg>' +
              "</button>" +
            "</div>" +
            '<div class="song-card__meta">' +
              '<span class="song-card__title">' + escapeHtml(track.title) + "</span>" +
              '<span class="song-card__artist">' + escapeHtml(track.artist) + "</span>" +
            "</div>" +
            '<button class="icon-btn song-card__fav' + (favourite ? " is-active" : "") + '" data-action="toggle-fav" data-id="' + track.id + '" aria-label="Toggle favourite">' +
              '<svg class="icon" aria-hidden="true"><use href="#icon-heart' + (favourite ? "-filled" : "") + '"></use></svg>' +
            "</button>" +
          "</article>"
        );
      }).join("");
    }

    function renderRecent() {
      const ids = Storage.getRecents();
      renderTrackList($("#recentList"), ids, "recent");
      $("#recentEmpty").hidden = ids.length > 0;
    }

    function renderCollections() {
      $("#collectionsGrid").innerHTML = COLLECTIONS.map(function (collection) {
        const firstTrack = getTrackById(collection.tracks[0]);
        const cover = firstTrack ? firstTrack.cover : "";
        const count = collection.tracks.length + (collection.tracks.length === 1 ? " song" : " songs");

        return (
          '<article class="song-card collection-card" data-action="play-collection" data-collection="' + collection.id + '">' +
            '<div class="song-card__art">' +
              '<img src="' + cover + '" alt="" loading="lazy" />' +
              '<button class="song-card__play" data-action="play-collection" data-collection="' + collection.id + '" aria-label="Play ' + escapeHtml(collection.name) + '">' +
                '<svg class="icon" aria-hidden="true"><use href="#icon-play"></use></svg>' +
              "</button>" +
            "</div>" +
            '<div class="song-card__meta">' +
              '<span class="song-card__title">' + escapeHtml(collection.name) + "</span>" +
              '<span class="song-card__artist">' + count + "</span>" +
            "</div>" +
          "</article>"
        );
      }).join("");
    }

    function renderPlaylists() {
      const playlists = Storage.getPlaylists();

      $("#playlistsGrid").innerHTML = playlists.map(function (playlist) {
        return (
          '<article class="playlist-card" data-action="open-playlist" data-playlist="' + playlist.id + '">' +
            '<span class="playlist-card__name">' + escapeHtml(playlist.name) + "</span>" +
            '<span class="playlist-card__count">' + playlist.tracks.length + " songs</span>" +
            '<div class="playlist-card__actions">' +
              '<button class="btn btn--ghost" data-action="play-playlist-card" data-playlist="' + playlist.id + '">' +
                '<svg class="icon" aria-hidden="true"><use href="#icon-play"></use></svg> Play' +
              "</button>" +
              '<button class="icon-btn" data-action="delete-playlist-card" data-playlist="' + playlist.id + '" aria-label="Delete playlist">' +
                '<svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg>' +
              "</button>" +
            "</div>" +
          "</article>"
        );
      }).join("");

      $("#playlistsEmpty").hidden = playlists.length > 0;
    }

    function renderFavourites() {
      const ids = Storage.getFavourites();
      renderTrackList($("#favouritesList"), ids, "favourites");
      $("#favouritesEmpty").hidden = ids.length > 0;
    }

    /* ---------- search ---------- */

    function setSearchClearVisible(visible) {
      const button = $(".search__clear");
      if (button) button.hidden = !visible;
    }

    function renderSearch(query) {
      const results = searchTracks(query);

      if (!query.trim()) {
        $("#searchResults").hidden = true;
        setSearchClearVisible(false);
        return;
      }

      const label = results.length + " result" + (results.length === 1 ? "" : "s") + ' for "' + query.trim() + '"';

      $("#searchResultsTitle").textContent = label;
      renderTrackList($("#searchResultsList"), results, "search");
      $("#searchEmpty").hidden = results.length > 0;
      $("#searchResults").hidden = false;
      setSearchClearVisible(true);
    }

    function clearSearch() {
      $("#searchInput").value = "";
      $("#searchInputMobile").value = "";
      $("#searchResults").hidden = true;
      setSearchClearVisible(false);
    }

    /* ---------- player display ---------- */

    function setIcon(button, iconId) {
      if (!button) return;
      const use = button.querySelector("use");
      if (use) use.setAttribute("href", "#" + iconId);
    }

    function setPlayIcons(playing) {
      $$(".play-btn use").forEach(function (use) {
        use.setAttribute("href", playing ? "#icon-pause" : "#icon-play");
      });

      document.body.classList.toggle("is-playing", playing);
      document.body.classList.toggle("is-paused", !playing);
    }

    function updateFavouriteButtons(trackId) {
      const favourite = Storage.isFavourite(trackId);
      const current = Player.getCurrentTrack();
      const isCurrent = current && current.id === trackId;

      if (isCurrent) {
        ["#playerFav", "#npFav"].forEach(function (selector) {
          const button = $(selector);
          if (!button) return;
          button.classList.toggle("is-active", favourite);
          setIcon(button, favourite ? "icon-heart-filled" : "icon-heart");
        });
      }
    }

    function renderNowPlaying(track) {
      if (!track) return;

      ["#player", "#miniplayer"].forEach(function (selector) {
        $(selector).hidden = false;
      });
      document.body.classList.add("has-player");

      $("#playerCover").src = track.cover;
      $("#playerTitle").textContent = track.title;
      $("#playerArtist").textContent = track.artist;
      $("#miniCover").src = track.cover;
      $("#miniTitle").textContent = track.title;
      $("#miniArtist").textContent = track.artist;
      $("#npCover").src = track.cover;
      $("#npTitle").textContent = track.title;
      $("#npArtist").textContent = track.artist + " · " + track.album;

      $("#heroCover").src = track.cover;
      $("#heroTitle").textContent = track.title;
      $("#heroArtist").textContent = track.artist;

      updateFavouriteButtons(track.id);
      renderQueue();
      renderLists();
    }

    function renderLists() {
      renderSongs();
      renderRecent();
      renderFavourites();
      if (openPlaylistId) renderPlaylistModal();
    }

    function renderQueue() {
      const queue = Player.getQueue();
      const current = Player.getCurrentTrack();
      const list = $("#queueList");
      if (!list) return;

      if (!queue.length) {
        list.innerHTML = '<li class="empty">The queue is empty.</li>';
        return;
      }

      list.innerHTML = queue.map(function (id, index) {
        const track = getTrackById(id);
        if (!track) return "";

        const playing = current && current.id === id;
        return (
          '<li class="queue-item' + (playing ? " is-playing" : "") + '" data-action="play-queue" data-index="' + index + '">' +
            '<span class="queue-item__num">' + (playing ? "▶" : pad(index + 1)) + "</span>" +
            '<img src="' + track.cover + '" alt="" loading="lazy" width="40" height="40" />' +
            '<span class="queue-item__meta">' +
              '<span class="queue-item__title">' + escapeHtml(track.title) + "</span>" +
              '<span class="queue-item__artist">' + escapeHtml(track.artist) + "</span>" +
            "</span>" +
          "</li>"
        );
      }).join("");
    }

    function updateModeButtons() {
      const shuffle = Player.isShuffle();
      const repeat = Player.getRepeat();

      $$('[data-action="shuffle"]').forEach(function (button) {
        button.classList.toggle("is-active", shuffle);
      });

      $$('[data-action="repeat"]').forEach(function (button) {
        button.classList.toggle("is-active", repeat !== "off");
        setIcon(button, repeat === "one" ? "icon-repeat-one" : "icon-repeat");
      });
    }

    function updateVolumeUI() {
      const volume = Player.getVolume();

      $$('[data-range="volume"]').forEach(function (range) {
        range.value = volume;
      });

      $$('[data-action="toggle-mute"]').forEach(function (button) {
        setIcon(button, volume === 0 ? "icon-mute" : "icon-volume");
      });
    }

    /* ---------- actions ---------- */

    function listIds(listKey) {
      if (!listKey || listKey === "all") return TRACKS.map(function (track) { return track.id; });
      if (listKey === "recent") return Storage.getRecents();
      if (listKey === "favourites") return Storage.getFavourites();
      if (listKey === "search") return searchTracks($("#searchInput").value);

      const parts = listKey.split(":");
      const type = parts[0];
      const id = parts[1];

      if (type === "collection") {
        const collection = COLLECTIONS.find(function (item) { return item.id === id; });
        return collection ? collection.tracks.slice() : [];
      }

      if (type === "playlist") {
        const playlist = Storage.getPlaylists().find(function (item) { return item.id === id; });
        return playlist ? playlist.tracks.slice() : [];
      }

      return [];
    }

    function playFromList(listKey, trackId) {
      const ids = listIds(listKey);
      if (!ids.length) {
        Player.playTrack(trackId);
        return;
      }
      Player.playContext(ids, Math.max(0, ids.indexOf(trackId)));
    }

    function toggleFavourite(trackId) {
      const saved = Storage.toggleFavourite(trackId);
      updateFavouriteButtons(trackId);
      renderSongs();
      renderFavourites();
      renderRecent();
      if (openPlaylistId) renderPlaylistModal();
      if (!$("#searchResults").hidden) renderSearch($("#searchInput").value);
      toast(saved ? "Added to favourites" : "Removed from favourites");
    }

    function playCollection(collectionId) {
      const collection = COLLECTIONS.find(function (item) { return item.id === collectionId; });
      if (!collection) return;

      Player.playContext(collection.tracks, 0);
      toast('Playing "' + collection.name + '"');
    }

    function shuffleAll() {
      const ids = TRACKS.map(function (track) { return track.id; });
      Player.setShuffle(true);
      Player.playContext(ids, Math.floor(Math.random() * ids.length));
      toast("Shuffling all " + ids.length + " songs");
    }

    function shuffleRecent() {
      const ids = Storage.getRecents();
      if (ids.length < 2) {
        toast("Play a few songs first");
        return;
      }

      Player.setShuffle(true);
      Player.playContext(ids, Math.floor(Math.random() * ids.length));
      toast("Shuffling your recent songs");
    }

    /* ---------- playlists ---------- */

    function createPlaylist(name) {
      const clean = name.trim();
      if (!clean) {
        toast("Give your playlist a name first");
        return null;
      }

      const playlist = Storage.createPlaylist(clean);
      renderPlaylists();
      toast('Created "' + clean + '"');
      return playlist;
    }

    function openPlaylist(playlistId) {
      openPlaylistId = playlistId;
      renderPlaylistModal();
      $("#playlistModal").hidden = false;
    }

    function closePlaylist() {
      openPlaylistId = null;
      $("#playlistModal").hidden = true;
    }

    function renderPlaylistModal() {
      const playlist = Storage.getPlaylists().find(function (item) {
        return item.id === openPlaylistId;
      });

      if (!playlist) {
        closePlaylist();
        return;
      }

      $("#playlistModalTitle").textContent = playlist.name;
      renderTrackList($("#playlistModalList"), playlist.tracks, "playlist:" + playlist.id);
      $("#playlistModalEmpty").hidden = playlist.tracks.length > 0;
    }

    function playPlaylist(playlistId) {
      const playlist = Storage.getPlaylists().find(function (item) {
        return item.id === playlistId;
      });

      if (!playlist || !playlist.tracks.length) {
        toast("This playlist has no songs yet");
        return;
      }

      Player.playContext(playlist.tracks, 0);
      toast('Playing "' + playlist.name + '"');
    }

    function deletePlaylist(playlistId) {
      const playlist = Storage.getPlaylists().find(function (item) {
        return item.id === playlistId;
      });
      if (!playlist) return;
      if (!window.confirm('Delete "' + playlist.name + '"? This cannot be undone.')) return;

      Storage.deletePlaylist(playlistId);
      renderPlaylists();
      if (openPlaylistId === playlistId) closePlaylist();
      toast("Playlist deleted");
    }

    /* ---------- add-to-playlist menu ---------- */

    function positionMenu(menu, anchor) {
      const rect = anchor.getBoundingClientRect();
      const width = menu.offsetWidth || MENU_WIDTH;
      const height = menu.offsetHeight || 300;
      const margin = 10;

      let left = Math.min(rect.right - width, window.innerWidth - width - margin);
      let top = rect.bottom + 8;

      if (top + height > window.innerHeight - margin) {
        top = Math.max(margin, rect.top - height - 8);
      }

      menu.style.left = Math.max(margin, left) + "px";
      menu.style.top = top + "px";
    }

    function openAddToPlaylistMenu(trackId, anchor) {
      const menu = $("#addToPlaylistMenu");
      const playlists = Storage.getPlaylists();

      const choices = playlists.map(function (playlist) {
        return (
          '<button data-action="add-to-playlist-choice" data-id="' + trackId + '" data-playlist="' + playlist.id + '">' +
            '<svg class="icon" aria-hidden="true"><use href="#icon-note"></use></svg>' +
            escapeHtml(playlist.name) +
          "</button>"
        );
      }).join("");

      menu.innerHTML =
        '<p class="popmenu__title">Add to playlist</p>' +
        (playlists.length ? choices : '<p class="popmenu__empty">No playlists yet.</p>') +
        '<button data-action="new-playlist-for-track" data-id="' + trackId + '">' +
          '<svg class="icon" aria-hidden="true"><use href="#icon-plus"></use></svg>New playlist' +
        "</button>";

      menu.hidden = false;
      positionMenu(menu, anchor);
    }

    function closeAddToPlaylistMenu() {
      $("#addToPlaylistMenu").hidden = true;
    }

    /* ---------- overlays ---------- */

    function toast(message) {
      const element = $("#toast");
      element.textContent = message;
      element.hidden = false;

      if (toastTimer) window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () {
        element.hidden = true;
      }, TOAST_MS);
    }

    function openNowPlaying() {
      $("#nowplaying").hidden = false;
    }

    function closeNowPlaying() {
      $("#nowplaying").hidden = true;
    }

    function toggleQueue() {
      const panel = $("#queuePanel");
      panel.hidden = !panel.hidden;
      if (!panel.hidden) renderQueue();
    }

    function toggleMenu() {
      const drawer = $("#navDrawer");
      const scrim = $("#scrim");
      const open = drawer.hidden;

      drawer.hidden = !open;
      scrim.hidden = !open;
      $(".menu-toggle").setAttribute("aria-expanded", String(open));
    }

    function closeMenu() {
      $("#navDrawer").hidden = true;
      $("#scrim").hidden = true;
      $(".menu-toggle").setAttribute("aria-expanded", "false");
    }

    /* ---------- click delegation ---------- */

    function handleAction(action, element, event) {
      switch (action) {
        case "play-pause": Player.toggle(); break;
        case "prev": Player.prev(); break;
        case "next": Player.next(true); break;
        case "shuffle": Player.toggleShuffle(); break;
        case "repeat": Player.cycleRepeat(); break;
        case "toggle-mute": Player.toggleMute(); break;

        case "play-track":
          playFromList(element.getAttribute("data-list"), element.getAttribute("data-id"));
          break;

        case "play-song":
          playFromList("all", element.getAttribute("data-id"));
          break;

        case "play-queue":
          Player.playContext(Player.getQueue(), parseInt(element.getAttribute("data-index"), 10));
          break;

        case "play-collection":
          playCollection(element.getAttribute("data-collection"));
          break;

        case "play-all":
          playFromList("all", HERO_TRACK_ID);
          break;

        case "toggle-fav": {
          const current = Player.getCurrentTrack();
          const id = element.getAttribute("data-id") || (current ? current.id : null);
          if (id) toggleFavourite(id);
          break;
        }

        case "shuffle-all":
          shuffleAll();
          closeMenu();
          break;

        case "shuffle-recent":
          shuffleRecent();
          break;

        case "add-to-playlist":
          event.stopPropagation();
          openAddToPlaylistMenu(element.getAttribute("data-id"), element);
          break;

        case "add-to-playlist-choice": {
          const trackId = element.getAttribute("data-id");
          const playlistId = element.getAttribute("data-playlist");
          Storage.addTrackToPlaylist(playlistId, trackId);
          renderPlaylists();
          if (openPlaylistId === playlistId) renderPlaylistModal();
          closeAddToPlaylistMenu();
          toast("Added to playlist");
          break;
        }

        case "new-playlist-for-track": {
          const trackId = element.getAttribute("data-id");
          const name = window.prompt("Name your new playlist:");
          if (name && name.trim()) {
            const playlist = createPlaylist(name);
            if (playlist) {
              Storage.addTrackToPlaylist(playlist.id, trackId);
              renderPlaylists();
              toast('Added to "' + playlist.name + '"');
            }
          }
          closeAddToPlaylistMenu();
          break;
        }

        case "open-playlist": openPlaylist(element.getAttribute("data-playlist")); break;
        case "close-playlist": closePlaylist(); break;
        case "play-playlist": playPlaylist(openPlaylistId); break;
        case "play-playlist-card": playPlaylist(element.getAttribute("data-playlist")); break;
        case "delete-playlist": deletePlaylist(openPlaylistId); break;
        case "delete-playlist-card": deletePlaylist(element.getAttribute("data-playlist")); break;

        case "toggle-queue": toggleQueue(); break;
        case "open-nowplaying": openNowPlaying(); break;
        case "close-nowplaying": closeNowPlaying(); break;
        case "toggle-menu": toggleMenu(); break;
        case "close-menu": closeMenu(); break;
        case "clear-search": clearSearch(); break;
      }
    }

    function bindEvents() {
      document.addEventListener("click", function (event) {
        const actionElement = event.target.closest("[data-action]");
        if (actionElement) {
          handleAction(actionElement.getAttribute("data-action"), actionElement, event);
          return;
        }

        const row = event.target.closest(".track");
        if (row) {
          playFromList(row.getAttribute("data-list"), row.getAttribute("data-id"));
          return;
        }

        if (!event.target.closest("#addToPlaylistMenu")) closeAddToPlaylistMenu();
        if (!event.target.closest(".site-header")) $("#searchResults").hidden = true;
      });

      const desktopSearch = $("#searchInput");
      const mobileSearch = $("#searchInputMobile");

      function handleSearch(value) {
        desktopSearch.value = value;
        mobileSearch.value = value;
        renderSearch(value);
      }

      desktopSearch.addEventListener("input", function (event) { handleSearch(event.target.value); });
      mobileSearch.addEventListener("input", function (event) { handleSearch(event.target.value); });
      $("#searchForm").addEventListener("submit", function (event) { event.preventDefault(); });

      $$('[data-range="volume"]').forEach(function (range) {
        range.addEventListener("input", function () {
          Player.setVolume(parseFloat(range.value));
        });
      });

      $$('[data-range="seek"]').forEach(function (range) {
        range.addEventListener("input", function () {
          seeking = true;
          Player.seek(parseFloat(range.value));
        });
        range.addEventListener("change", function () {
          seeking = false;
        });
      });

      $("#playlistForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const input = $("#playlistName");
        if (createPlaylist(input.value)) input.value = "";
      });

      $("#scrim").addEventListener("click", closeMenu);

      document.addEventListener("keydown", function (event) {
        const tag = (event.target.tagName || "").toLowerCase();
        const typing = tag === "input" || tag === "textarea" || event.target.isContentEditable;
        if (typing) return;

        if (event.code === "Space") {
          event.preventDefault();
          Player.toggle();
        } else if (event.key === "/") {
          event.preventDefault();
          const input = window.innerWidth <= 860 ? mobileSearch : desktopSearch;
          input.focus();
        } else if (event.key === "Escape") {
          closeNowPlaying();
          closePlaylist();
          if (!$("#queuePanel").hidden) $("#queuePanel").hidden = true;
          closeAddToPlaylistMenu();
          closeMenu();
        }
      });
    }

    function bindPlayerEvents() {
      Player.on("trackchange", function (track) {
        Storage.addRecent(track.id);
        renderNowPlaying(track);
      });

      Player.on("play", function () {
        setPlayIcons(true);
        renderLists();
      });

      Player.on("pause", function () {
        setPlayIcons(false);
      });

      Player.on("time", function (data) {
        const duration = data.duration || 0;
        const current = data.current || 0;

        $$('[data-range="seek"]').forEach(function (range) {
          if (range.max !== String(duration)) range.max = duration || 100;
          if (!seeking) range.value = current;
        });

        const currentText = formatTime(current);
        const totalText = formatTime(duration);

        if ($("#timeCurrent")) $("#timeCurrent").textContent = currentText;
        if ($("#timeTotal")) $("#timeTotal").textContent = totalText;
        if ($("#npCurrent")) $("#npCurrent").textContent = currentText;
        if ($("#npTotal")) $("#npTotal").textContent = totalText;

        const percent = duration ? (current / duration) * 100 : 0;
        $("#miniProgress").style.width = percent + "%";
      });

      Player.on("loadedmetadata", function (data) {
        $$('[data-range="seek"]').forEach(function (range) {
          range.max = data.duration || 100;
        });

        if ($("#timeTotal")) $("#timeTotal").textContent = formatTime(data.duration);
        if ($("#npTotal")) $("#npTotal").textContent = formatTime(data.duration);
      });

      Player.on("volumechange", updateVolumeUI);
      Player.on("modechange", updateModeButtons);

      Player.on("error", function (track) {
        toast("Could not play " + (track ? '"' + track.title + '"' : "this song"));
      });
    }

    function init() {
      renderHero();
      renderStats();
      renderSongs();
      renderRecent();
      renderCollections();
      renderPlaylists();
      renderFavourites();
      updateVolumeUI();
      updateModeButtons();
      setPlayIcons(false);
      bindEvents();
      bindPlayerEvents();
    }

    return { init: init, toast: toast };
  })();

  /* ---------- 5. START ---------- */

  function start() {
    Player.init();
    UI.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
