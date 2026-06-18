(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
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
    start();
  });

  document.querySelectorAll('[data-card-list]').forEach(function (list) {
    var scope = list.closest('main') || document;
    var input = scope.querySelector('[data-search-input]');
    var group = scope.querySelector('[data-filter-group]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var currentFilter = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var type = normalize(card.getAttribute('data-type'));
        var region = normalize(card.getAttribute('data-region'));
        var year = normalize(card.getAttribute('data-year'));
        var filter = normalize(currentFilter);
        var filterHit = filter === 'all' || type === filter || region === filter || year === filter || text.indexOf(filter) >= 0;
        var keywordHit = !keyword || text.indexOf(keyword) >= 0;
        card.classList.toggle('is-hidden', !(filterHit && keywordHit));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (group) {
      group.addEventListener('click', function (event) {
        var button = event.target.closest('[data-filter-value]');
        if (!button) {
          return;
        }
        currentFilter = button.getAttribute('data-filter-value') || 'all';
        group.querySelectorAll('[data-filter-value]').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    }
  });
})();
