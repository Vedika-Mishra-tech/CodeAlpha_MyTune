/* =============================================================
   MyTune - ui.js
   -------------------------------------------------------------
   Everything the listener sees and touches:
     - drawing the lists (recently played, favourites, search, ...)
     - the featured / hero content
     - playlists and the "add to playlist" menu
     - the queue, the now-playing screen and the toast messages

   It listens to the Player (play, pause, time, ...) and updates
   the screen in response.
   ============================================================= */

window.MyTune = window.MyTune || {};

const UI = (function () {
  const { TRACKS, COLLECTIONS, getTrackById } = window.MyTune;
  const Storage = window.MyTune.Storage;
  const Player = window.MyTune.Player;

  /* Tiny helpers to find elements. */
  const $ = function (selector) { return document.querySelector(selector); };
  const $$ = function (selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); };

  /* The featured song on the home page. */
  const featuredId = TRACKS[0].id;

  /* Which playlist is open in the modal (or null). */
  let openPlaylistId = null;

  /* Are we currently dragging a seek slider? */
  let seeking = false;

  /* -----------------------------------------------------------
     FORMATTING HELPERS
     ----------------------------------------------------------- */

  /* Turn 174 into "2:54". */
  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const total = Math.floor(seconds);
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return minutes + ":" + (secs < 10 ? "0" + secs : secs);
  }

  /* Protect against weird characters in titles. */
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function pad(number) {
    return number < 10 ? "0" + number : String(number);
  }

  /* -----------------------------------------------------------
     TRACK ROW BUILDER
     Every list of songs uses the same markup. `listKey` tells the
     click handler which list the song belongs to, so that Next /
     Previous move through the right queue.
     ----------------------------------------------------------- */
  function trackRow(track, listKey, index) {
    const isFavourite = Storage.isFavourite(track.id);
    const current = Player.getCurrentTrack();
    const isPlaying = current && current.id === track.id;
    const tags = (track.tags || []).slice(0, 2).map(function (tag) {
      return '<span class="track__tag">' + escapeHtml(tag) + "</span>";
    }).join("");

    const indexContent = isPlaying
      ? '<span class="eq" aria-hidden="true"><span></span><span></span><span></span></span>'
      : '<svg class="icon" aria-hidden="true"><use href="#icon-play"></use></svg>';

    return (
      '<li class="track' + (isPlaying ? " is-playing" : "") + '" data-id="' + track.id + '" data-list="' + listKey + '">' +
        '<button class="track__index" data-action="play-track" data-id="' + track.id + '" data-list="' + listKey + '" aria-label="Play ' + escapeHtml(track.title) + '">' +
          indexContent +
        "</button>" +
        '<img class="track__cover" src="' + track.cover + '" alt="" loading="lazy" width="54" height="54" />' +
        '<div class="track__main">' +
          '<span class="track__title">' + escapeHtml(track.title) + "</span>" +
          '<span class="track__artist">' + escapeHtml(track.artist) + "</span>" +
        "</div>" +
        '<div class="track__tags">' + tags + "</div>" +
        '<span class="track__duration">' + formatTime(track.duration) + "</span>" +
        '<div class="track__actions">' +
          '<button class="icon-btn' + (isFavourite ? " is-active" : "") + '" data-action="toggle-fav" data-id="' + track.id + '" aria-label="Toggle favourite" aria-pressed="' + isFavourite + '">' +
            '<svg class="icon" aria-hidden="true"><use href="#icon-heart' + (isFavourite ? "-filled" : "") + '"></use></svg>' +
          "</button>" +
          '<button class="icon-btn" data-action="add-to-playlist" data-id="' + track.id + '" aria-label="Add to playlist">' +
            '<svg class="icon" aria-hidden="true"><use href="#icon-plus"></use></svg>' +
          "</button>" +
        "</div>" +
      "</li>"
    );
  }

  /* Render a list of track ids into a <ul>. */
  function renderTrackList(container, ids, listKey, options) {
    if (!container) return;
    options = options || {};
    if (!ids.length) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = ids.map(function (id, index) {
      const track = getTrackById(id);
      if (!track) return "";
      return trackRow(track, listKey, options.showIndex ? index + 1 : null);
    }).join("");
  }

  /* -----------------------------------------------------------
     SECTION RENDERERS
     ----------------------------------------------------------- */

  function renderHero() {
    const track = getTrackById(featuredId);
    $("#heroCover").src = track.cover;
    $("#heroTitle").textContent = track.title;
    $("#heroArtist").textContent = track.artist;
  }

  function renderFeatured() {
    const track = getTrackById(featuredId);
    const collection = COLLECTIONS.find(function (item) {
      return item.id === "golden-hour";
    });
    $("#featuredCover").src = track.cover;
    $("#featuredGenre").textContent = track.genre;
    $("#featuredTitle").textContent = track.title;
    $("#featuredArtist").textContent = track.artist;
    $("#featuredDesc").textContent =
      "A warm, rhythmic " + track.genre.toLowerCase() + " piece by " + track.artist +
      ". Released to the public domain in " + track.year + ".";
    $("#featuredCaption").textContent = "MyTune · " + track.album;
    renderTrackList($("#featuredTracklist"), collection.tracks, "collection:" + collection.id);
    updateFavouriteButtons(track.id);
  }

  function renderRecent() {
    const ids = Storage.getRecents();
    renderTrackList($("#recentList"), ids, "recent");
    $("#recentEmpty").hidden = ids.length > 0;
  }

  function renderCollections() {
    const grid = $("#collectionsGrid");
    grid.innerHTML = COLLECTIONS.map(function (collection) {
      return (
        '<article class="collection collection--' + collection.accent + '" data-action="play-collection" data-collection="' + collection.id + '">' +
          '<h3 class="collection__name">' + escapeHtml(collection.name) + "</h3>" +
          '<p class="collection__blurb">' + escapeHtml(collection.blurb) + "</p>" +
          '<div class="collection__meta">' +
            '<span class="collection__count">' + collection.tracks.length + " tracks</span>" +
            '<button class="collection__play" data-action="play-collection" data-collection="' + collection.id + '" aria-label="Play ' + escapeHtml(collection.name) + '">' +
              '<svg class="icon" aria-hidden="true"><use href="#icon-play"></use></svg>' +
            "</button>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  function renderPlaylists() {
    const playlists = Storage.getPlaylists();
    const grid = $("#playlistsGrid");
    grid.innerHTML = playlists.map(function (playlist) {
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

  function renderCredits() {
    const list = $("#creditsList");
    list.innerHTML = TRACKS.map(function (track) {
      return (
        '<li class="credit">' +
          "<div>" +
            '<span class="credit__name">' + escapeHtml(track.title) + "</span> " +
            '<span class="credit__artist">— ' + escapeHtml(track.artist) + "</span>" +
          "</div>" +
          '<div class="credit__meta">' +
            '<a href="' + track.page + '" target="_blank" rel="noopener">' + track.license.source + "</a>" +
            " · " +
            '<a href="' + track.license.url + '" target="_blank" rel="noopener">CC0 1.0</a>' +
          "</div>" +
        "</li>"
      );
    }).join("");
  }

  /* Search across titles, artists, albums, genres and tags. */
  function searchTracks(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return TRACKS.filter(function (track) {
      const haystack = [
        track.title,
        track.artist,
        track.album,
        track.genre,
        track.mood
      ].concat(track.tags || []).join(" ").toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).map(function (track) { return track.id; });
  }

  function renderSearch() {
    const query = $("#searchInput").value;
    const results = searchTracks(query);
    const panel = $("#searchResults");

    if (!query.trim()) {
      panel.hidden = true;
      return;
    }

    $("#searchResultsTitle").textContent = results.length + " result" + (results.length === 1 ? "" : "s") + " for “" + query.trim() + "”";
    renderTrackList($("#searchResultsList"), results, "search");
    $("#searchEmpty").hidden = results.length > 0;
    panel.hidden = false;
    $("#searchInput").closest(".search").querySelector(".search__clear").hidden = false;
  }

  function clearSearch() {
    $("#searchInput").value = "";
    $("#searchInputMobile").value = "";
    $("#searchResults").hidden = true;
    const clearButton = $(".search__clear");
    if (clearButton) clearButton.hidden = true;
  }

  /* -----------------------------------------------------------
     PLAYER INTERFACE UPDATES
     ----------------------------------------------------------- */

  /* Swap the play/pause icon on every big play button. */
  function setPlayIcons(isPlaying) {
    $$(".play-btn use").forEach(function (use) {
      use.setAttribute("href", isPlaying ? "#icon-pause" : "#icon-play");
    });
    document.body.classList.toggle("is-playing", isPlaying);
    document.body.classList.toggle("is-paused", !isPlaying);
  }

  function setIcon(button, iconId) {
    if (!button) return;
    const use = button.querySelector("use");
    if (use) use.setAttribute("href", "#" + iconId);
  }

  function updateFavouriteButtons(trackId) {
    const isFavourite = Storage.isFavourite(trackId);
    const current = Player.getCurrentTrack();
    const isCurrent = current && current.id === trackId;

    if (isCurrent) {
      ["#playerFav", "#npFav"].forEach(function (selector) {
        const button = $(selector);
        if (!button) return;
        button.classList.toggle("is-active", isFavourite);
        setIcon(button, isFavourite ? "icon-heart-filled" : "icon-heart");
      });
    }

    if (trackId === featuredId) {
      const button = $("#featuredFav");
      button.classList.toggle("is-active", isFavourite);
      setIcon(button, isFavourite ? "icon-heart-filled" : "icon-heart");
      button.querySelector("span").textContent = isFavourite ? "Favourited" : "Favourite";
    }
  }

  /* Update the fixed players when the song changes. */
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

    /* The hero "now spinning" note follows the music too. */
    $("#heroCover").src = track.cover;
    $("#heroTitle").textContent = track.title;
    $("#heroArtist").textContent = track.artist;

    updateFavouriteButtons(track.id);
    renderQueue();
    renderRecentlyAndFavourites();
  }

  /* Re-render the lists that show a "now playing" highlight. */
  function renderRecentlyAndFavourites() {
    renderRecent();
    renderFavourites();
    renderFeatured();
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
      const isPlaying = current && current.id === id;
      return (
        '<li class="queue-item' + (isPlaying ? " is-playing" : "") + '" data-action="play-queue" data-id="' + id + '" data-index="' + index + '">' +
          '<span class="queue-item__num">' + (isPlaying ? "▶" : pad(index + 1)) + "</span>" +
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

  /* -----------------------------------------------------------
     ACTIONS
     ----------------------------------------------------------- */

  /* Build the id list for a given list key. */
  function listIds(listKey) {
    if (!listKey) return TRACKS.map(function (track) { return track.id; });
    if (listKey === "recent") return Storage.getRecents();
    if (listKey === "favourites") return Storage.getFavourites();
    if (listKey === "search") return searchTracks($("#searchInput").value);
    if (listKey.indexOf("collection:") === 0) {
      const collection = COLLECTIONS.find(function (item) {
        return "collection:" + item.id === listKey;
      });
      return collection ? collection.tracks.slice() : [];
    }
    if (listKey.indexOf("playlist:") === 0) {
      const playlist = Storage.getPlaylists().find(function (item) {
        return "playlist:" + item.id === listKey;
      });
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
    const index = Math.max(0, ids.indexOf(trackId));
    Player.playContext(ids, index);
  }

  function toggleFavourite(trackId) {
    const nowFavourite = Storage.toggleFavourite(trackId);
    updateFavouriteButtons(trackId);
    renderFavourites();
    renderRecent();
    renderFeatured();
    if (openPlaylistId) renderPlaylistModal();
    toast(nowFavourite ? "Added to favourites" : "Removed from favourites");
  }

  function playCollection(collectionId) {
    const collection = COLLECTIONS.find(function (item) { return item.id === collectionId; });
    if (!collection) return;
    Player.playContext(collection.tracks, 0);
    toast("Playing “" + collection.name + "”");
  }

  function shuffleAll() {
    const ids = TRACKS.map(function (track) { return track.id; });
    Player.setShuffle(true);
    Player.playContext(ids, Math.floor(Math.random() * ids.length));
    toast("Shuffling all 15 songs");
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

  /* ---------------- Playlists ---------------- */
  function createPlaylist(name) {
    const clean = name.trim();
    if (!clean) {
      toast("Give your playlist a name first");
      return null;
    }
    const playlist = Storage.createPlaylist(clean);
    renderPlaylists();
    toast("Created “" + clean + "”");
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
    toast("Playing “" + playlist.name + "”");
  }

  function deletePlaylist(playlistId) {
    const playlist = Storage.getPlaylists().find(function (item) {
      return item.id === playlistId;
    });
    if (!playlist) return;
    if (!window.confirm('Delete the playlist "' + playlist.name + '"? This cannot be undone.')) return;
    Storage.deletePlaylist(playlistId);
    renderPlaylists();
    if (openPlaylistId === playlistId) closePlaylist();
    toast("Playlist deleted");
  }

  /* ---------------- Add-to-playlist pop menu ---------------- */
  function openAddToPlaylistMenu(trackId, anchor) {
    const menu = $("#addToPlaylistMenu");
    const playlists = Storage.getPlaylists();

    let html = '<p class="popmenu__title">Add to playlist</p>';
    if (!playlists.length) {
      html += "<p style=\"padding:0.4rem 0.6rem;font-size:0.85rem;color:#4A5651\">No playlists yet.</p>";
    }
    html += playlists.map(function (playlist) {
      return '<button data-action="add-to-playlist-choice" data-id="' + trackId + '" data-playlist="' + playlist.id + '">' +
        '<svg class="icon" aria-hidden="true"><use href="#icon-note"></use></svg>' +
        escapeHtml(playlist.name) +
      "</button>";
    }).join("");
    html += '<button data-action="new-playlist-for-track" data-id="' + trackId + '">' +
      '<svg class="icon" aria-hidden="true"><use href="#icon-plus"></use></svg>New playlist…' +
    "</button>";

    menu.innerHTML = html;
    menu.hidden = false;

    /* Position the menu under the button that opened it. */
    const rect = anchor.getBoundingClientRect();
    const menuWidth = 240;
    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    let top = rect.bottom + 8;
    if (top + 300 > window.innerHeight) {
      top = Math.max(10, rect.top - 8 - Math.min(300, menu.offsetHeight || 300));
    }
    menu.style.left = left + "px";
    menu.style.top = top + "px";
  }

  function closeAddToPlaylistMenu() {
    $("#addToPlaylistMenu").hidden = true;
  }

  /* ---------------- Toast ---------------- */
  let toastTimer = null;
  function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.hidden = false;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      element.hidden = true;
    }, 2600);
  }

  /* ---------------- Overlays ---------------- */
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

  /* -----------------------------------------------------------
     CLICK HANDLING
     One listener handles every button in the app, because each
     button carries a `data-action` attribute.
     ----------------------------------------------------------- */
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

      case "play-queue": {
        const index = parseInt(element.getAttribute("data-index"), 10);
        Player.playContext(Player.getQueue(), index);
        break;
      }

      case "play-collection":
        playCollection(element.getAttribute("data-collection"));
        break;

      case "play-featured":
        Player.playContext(listIds("collection:golden-hour"), listIds("collection:golden-hour").indexOf(featuredId));
        break;

      case "fav-featured":
        toggleFavourite(featuredId);
        break;

      case "toggle-fav": {
        const current = Player.getCurrentTrack();
        const id = element.getAttribute("data-id") || (current ? current.id : null);
        if (id) toggleFavourite(id);
        break;
      }

      case "shuffle-all": shuffleAll(); closeMenu(); break;
      case "shuffle-recent": shuffleRecent(); break;

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
            toast("Added to “" + playlist.name + "”");
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

  /* -----------------------------------------------------------
     BINDING
     ----------------------------------------------------------- */
  function bindEvents() {
    /* Global click delegation. */
    document.addEventListener("click", function (event) {
      const actionElement = event.target.closest("[data-action]");
      if (actionElement) {
        handleAction(actionElement.getAttribute("data-action"), actionElement, event);
        return;
      }

      /* Clicking anywhere else on a track row plays that song. */
      const row = event.target.closest(".track");
      if (row) {
        playFromList(row.getAttribute("data-list"), row.getAttribute("data-id"));
        return;
      }

      /* Close the add-to-playlist menu when clicking elsewhere. */
      if (!event.target.closest("#addToPlaylistMenu")) closeAddToPlaylistMenu();

      /* Close search results when clicking outside the header. */
      if (!event.target.closest(".site-header")) {
        $("#searchResults").hidden = true;
      }
    });

    /* Search inputs (desktop + mobile stay in sync). */
    $("#searchInput").addEventListener("input", renderSearch);
    $("#searchInputMobile").addEventListener("input", function (event) {
      $("#searchInput").value = event.target.value;
      renderSearch();
    });
    $("#searchForm").addEventListener("submit", function (event) { event.preventDefault(); });

    /* Volume + seek sliders. */
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

    /* Playlist creation form. */
    $("#playlistForm").addEventListener("submit", function (event) {
      event.preventDefault();
      const input = $("#playlistName");
      if (createPlaylist(input.value)) input.value = "";
    });

    /* Scrim closes the mobile menu / overlays. */
    $("#scrim").addEventListener("click", closeMenu);

    /* Keyboard shortcuts: Space = play/pause, / = search. */
    document.addEventListener("keydown", function (event) {
      const tag = (event.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (event.code === "Space") {
        event.preventDefault();
        Player.toggle();
      } else if (event.key === "/") {
        event.preventDefault();
        const input = window.innerWidth <= 860 ? $("#searchInputMobile") : $("#searchInput");
        input.focus();
      } else if (event.key === "Escape") {
        closeNowPlaying();
        closePlaylist();
        toggleQueueIfOpen();
        closeAddToPlaylistMenu();
        closeMenu();
      }
    });
  }

  function toggleQueueIfOpen() {
    const panel = $("#queuePanel");
    if (!panel.hidden) panel.hidden = true;
  }

  /* -----------------------------------------------------------
     PLAYER EVENT LISTENERS
     ----------------------------------------------------------- */
  function bindPlayerEvents() {
    Player.on("trackchange", function (track) {
      renderNowPlaying(track);
      Storage.addRecent(track.id);
      renderRecent();
      renderQueue();
    });

    Player.on("play", function () {
      setPlayIcons(true);
      renderRecentlyAndFavourites();
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
      toast("Could not play “" + (track ? track.title : "this song") + "”");
    });
  }

  /* -----------------------------------------------------------
     INITIAL RENDER
     ----------------------------------------------------------- */
  function init() {
    renderHero();
    renderFeatured();
    renderRecent();
    renderCollections();
    renderPlaylists();
    renderFavourites();
    renderCredits();
    updateVolumeUI();
    updateModeButtons();
    setPlayIcons(false);
    bindEvents();
    bindPlayerEvents();
  }

  return { init: init, toast: toast };
})();

window.MyTune.UI = UI;
