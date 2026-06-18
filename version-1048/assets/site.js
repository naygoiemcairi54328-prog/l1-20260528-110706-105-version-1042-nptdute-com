(function () {
  const header = document.querySelector(".site-header");
  const menu = document.querySelector(".menu-toggle");

  if (header && menu) {
    menu.addEventListener("click", function () {
      const open = header.classList.toggle("nav-open");
      menu.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });

    start();
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    const input = scope.querySelector("[data-filter-input]");
    const genre = scope.querySelector("[data-filter-genre]");
    const region = scope.querySelector("[data-filter-region]");
    const cards = Array.from(scope.querySelectorAll(".movie-card, .ranking-card"));

    function apply() {
      const query = input ? input.value.trim().toLowerCase() : "";
      const genreValue = genre ? genre.value : "";
      const regionValue = region ? region.value : "";

      cards.forEach(function (card) {
        const haystack = (card.getAttribute("data-search") || "").toLowerCase();
        const cardGenre = card.getAttribute("data-genre") || "";
        const cardRegion = card.getAttribute("data-region") || "";
        const matchText = !query || haystack.indexOf(query) !== -1;
        const matchGenre = !genreValue || cardGenre === genreValue;
        const matchRegion = !regionValue || cardRegion === regionValue;
        card.hidden = !(matchText && matchGenre && matchRegion);
      });
    }

    [input, genre, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });

  document.querySelectorAll(".player-shell").forEach(function (box) {
    const video = box.querySelector("video");
    const cover = box.querySelector(".player-cover");
    const uri = box.getAttribute("data-play-uri");
    let ready = false;
    let hls = null;

    function prepare() {
      if (!video || !uri || ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = uri;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(uri);
        hls.attachMedia(video);
      } else {
        video.src = uri;
      }

      video.controls = true;
      ready = true;
    }

    function play() {
      prepare();
      box.classList.add("is-playing");
      const action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    if (cover && video) {
      cover.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!ready) {
          play();
        } else if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("ended", function () {
        box.classList.remove("is-playing");
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
})();
