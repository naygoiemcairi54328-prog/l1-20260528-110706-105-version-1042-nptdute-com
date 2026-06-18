(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === active);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var list = document.querySelector("[data-filter-list]");
      var empty = scope.querySelector("[data-empty-state]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (initialQuery && input) {
        input.value = initialQuery;
      }

      function apply() {
        var query = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type")
          ].join(" "));
          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
          var matchedType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
          var matched = matchedQuery && matchedRegion && matchedType;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (root) {
      var video = root.querySelector("video");
      var cover = root.querySelector(".player-cover");
      var stream = root.getAttribute("data-stream");
      var started = false;
      var hls = null;
      if (!video || !stream) {
        return;
      }

      function attach() {
        if (started) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        started = true;
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (!started) {
          play();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
