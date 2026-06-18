(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('[data-search-input]').forEach(function (input) {
      var scope = input.closest('section') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          card.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
        });
      });
    });

    document.querySelectorAll('.video-player').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-overlay');
      var url = player.getAttribute('data-url');
      var hls = null;

      function attach() {
        if (!video || !url || video.getAttribute('data-ready') === '1') {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }

        video.setAttribute('data-ready', '1');
      }

      function play() {
        attach();
        if (!video) {
          return;
        }
        player.classList.add('playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('playing');
        });
        video.addEventListener('pause', function () {
          if (video.currentTime === 0 || video.ended) {
            player.classList.remove('playing');
          }
        });
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
