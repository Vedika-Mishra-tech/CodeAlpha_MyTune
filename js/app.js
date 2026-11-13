/* =============================================================
   MyTune - app.js
   -------------------------------------------------------------
   The starting point. It waits for the page to be ready, then
   turns on the audio engine and draws the interface.
   ============================================================= */

(function () {
  const Player = window.MyTune.Player;
  const UI = window.MyTune.UI;

  function start() {
    Player.init();  // read saved volume / shuffle / repeat settings
    UI.init();      // build the page and wire up every control
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
