(function () {
  var body = document.body;
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      body.classList.toggle('nav-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var input = filterPanel.querySelector('[data-search-input]');
    var region = filterPanel.querySelector('[data-region-filter]');
    var year = filterPanel.querySelector('[data-year-filter]');
    var clear = filterPanel.querySelector('[data-filter-clear]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input && initial) {
      input.value = initial;
    }

    var normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    var applyFilter = function () {
      var keyword = normalize(input && input.value);
      var selectedRegion = normalize(region && region.value);
      var selectedYear = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var ok = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }

        if (selectedRegion && normalize(card.getAttribute('data-region')) !== selectedRegion) {
          ok = false;
        }

        if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';

        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    };

    [input, region, year].forEach(function (field) {
      if (field) {
        field.addEventListener('input', applyFilter);
        field.addEventListener('change', applyFilter);
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (year) {
          year.value = '';
        }
        applyFilter();
      });
    }

    applyFilter();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('.player-frame'));

  players.forEach(function (frame) {
    var video = frame.querySelector('video');
    var cover = frame.querySelector('.player-cover');
    var stream = frame.getAttribute('data-stream');
    var loaded = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    var bind = function () {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    var play = function () {
      bind();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    };

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (cover) {
        cover.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
