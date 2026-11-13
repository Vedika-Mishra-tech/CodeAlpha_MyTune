/* =============================================================
   MyTune - player.js
   -------------------------------------------------------------
   The audio engine. It wraps the browser's <audio> element
   (the HTML Audio API) and adds the features a music app needs:

     - play / pause
     - next / previous
     - a queue of songs
     - shuffle and repeat (off / all / one)
     - volume and mute
     - seeking (jumping to a position in a song)

   Other files talk to it through  MyTune.Player  and listen for
   events with  Player.on("eventName", handler).
   ============================================================= */

window.MyTune = window.MyTune || {};

const Player = (function () {
  const Storage = window.MyTune.Storage;

  /* One real HTML audio element drives everything. */
  const audio = new Audio();
  audio.preload = "metadata";

  /* Internal state. */
  let queue = [];            // list of track ids waiting to play
  let currentIndex = -1;     // where we are inside `queue`
  let shuffle = false;
  let repeat = "off";        // "off" | "all" | "one"
  let listeners = {};        // event name -> array of functions

  /* ---------- tiny event system ---------- */
  function on(eventName, handler) {
    if (!listeners[eventName]) listeners[eventName] = [];
    listeners[eventName].push(handler);
  }

  function emit(eventName, payload) {
    (listeners[eventName] || []).forEach(function (handler) {
      handler(payload);
    });
  }

  /* ---------- helpers ---------- */
  function getCurrentId() {
    return queue[currentIndex] || null;
  }

  function getCurrentTrack() {
    const id = getCurrentId();
    return id ? window.MyTune.getTrackById(id) : null;
  }

  function loadTrack(trackId, autoplay) {
    const track = window.MyTune.getTrackById(trackId);
    if (!track) return;
    audio.src = track.src;
    emit("trackchange", track);
    if (autoplay) {
      play();
    } else {
      emit("pause", track);
    }
  }

  /* ---------- core controls ---------- */
  function play() {
    const promise = audio.play();
    /* play() returns a Promise on modern browsers. If the user
       has not interacted with the page yet it can be rejected. */
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
    if (audio.paused) {
      play();
    } else {
      pause();
    }
  }

  /* Start a list of tracks at a chosen position. */
  function playContext(ids, startIndex) {
    if (!ids || !ids.length) return;
    queue = ids.slice();
    currentIndex = startIndex || 0;
    loadTrack(queue[currentIndex], true);
    emit("queuechange", queue);
  }

  /* Play a single song while keeping it inside the current queue
     if it is already there, otherwise start a fresh queue. */
  function playTrack(trackId) {
    const existing = queue.indexOf(trackId);
    if (existing !== -1) {
      currentIndex = existing;
      loadTrack(trackId, true);
    } else {
      playContext([trackId], 0);
    }
  }

  function next(manual) {
    if (!queue.length) return;

    if (repeat === "one" && !manual) {
      audio.currentTime = 0;
      play();
      return;
    }

    let nextIndex;
    if (shuffle && queue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === currentIndex);
    } else {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex >= queue.length) {
      /* End of the queue: loop when repeat is on, or when the
         listener pressed Next themselves. */
      if (repeat === "all" || manual) {
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

    /* If we are more than 3 seconds in, restart the song first -
       this matches how most music apps behave. */
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = shuffle ? Math.floor(Math.random() * queue.length) : queue.length - 1;
    }
    currentIndex = prevIndex;
    loadTrack(queue[currentIndex], true);
  }

  function seek(seconds) {
    if (isFinite(seconds)) {
      audio.currentTime = seconds;
    }
  }

  function seekPercent(percent) {
    if (isFinite(audio.duration)) {
      audio.currentTime = (percent / 100) * audio.duration;
    }
  }

  /* ---------- volume ---------- */
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

  /* ---------- shuffle & repeat ---------- */
  function setShuffle(value) {
    shuffle = !!value;
    saveSettings();
    emit("modechange", { shuffle: shuffle, repeat: repeat });
  }

  function toggleShuffle() {
    setShuffle(!shuffle);
  }

  function setRepeat(mode) {
    repeat = mode;
    saveSettings();
    emit("modechange", { shuffle: shuffle, repeat: repeat });
  }

  function cycleRepeat() {
    const order = ["off", "all", "one"];
    const nextMode = order[(order.indexOf(repeat) + 1) % order.length];
    setRepeat(nextMode);
  }

  /* ---------- persistence ---------- */
  function saveSettings() {
    Storage.saveSettings({
      volume: audio.volume,
      shuffle: shuffle,
      repeat: repeat
    });
  }

  /* ---------- audio element events ---------- */
  audio.addEventListener("play", function () {
    emit("play", getCurrentTrack());
  });

  audio.addEventListener("pause", function () {
    emit("pause", getCurrentTrack());
  });

  audio.addEventListener("timeupdate", function () {
    emit("time", {
      current: audio.currentTime,
      duration: audio.duration
    });
  });

  audio.addEventListener("loadedmetadata", function () {
    emit("loadedmetadata", {
      current: audio.currentTime,
      duration: audio.duration
    });
  });

  audio.addEventListener("ended", function () {
    next(false);
  });

  audio.addEventListener("error", function () {
    emit("error", getCurrentTrack());
  });

  /* ---------- set up from saved settings ---------- */
  function init() {
    const settings = Storage.getSettings();
    audio.volume = typeof settings.volume === "number" ? settings.volume : 0.8;
    shuffle = !!settings.shuffle;
    repeat = settings.repeat || "off";
  }

  /* Public API. */
  return {
    init: init,
    audio: audio,
    on: on,
    play: play,
    pause: pause,
    toggle: toggle,
    playTrack: playTrack,
    playContext: playContext,
    next: next,
    prev: prev,
    seek: seek,
    seekPercent: seekPercent,
    setVolume: setVolume,
    getVolume: getVolume,
    toggleMute: toggleMute,
    toggleShuffle: toggleShuffle,
    setShuffle: setShuffle,
    cycleRepeat: cycleRepeat,
    getCurrentTrack: getCurrentTrack,
    getQueue: function () { return queue.slice(); },
    isPlaying: function () { return !audio.paused; },
    isShuffle: function () { return shuffle; },
    getRepeat: function () { return repeat; }
  };
})();

window.MyTune.Player = Player;
