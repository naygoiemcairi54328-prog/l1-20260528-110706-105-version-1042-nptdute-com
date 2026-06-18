(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var video = document.querySelector("[data-player-video]");
    var playButton = document.querySelector("[data-player-button]");

    if (!video || !playButton) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (attached || !stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        attached = true;
        return;
      }

      video.src = stream;
      attached = true;
    }

    function playVideo() {
      attachStream();
      playButton.classList.add("is-hidden");
      video.controls = true;

      var playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          playButton.classList.remove("is-hidden");
        });
      }
    }

    playButton.addEventListener("click", playVideo);

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", function () {
      playButton.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
      playButton.classList.remove("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
