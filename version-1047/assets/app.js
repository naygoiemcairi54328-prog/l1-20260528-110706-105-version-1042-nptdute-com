(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var nextButton = document.querySelector("[data-hero-next]");
    var prevButton = document.querySelector("[data-hero-prev]");
    var currentSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentSlide = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentSlide);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentSlide);
      });
    }

    function startHero() {
      if (heroTimer || slides.length < 2) {
        return;
      }

      heroTimer = window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    function restartHero() {
      if (heroTimer) {
        window.clearInterval(heroTimer);
        heroTimer = null;
      }
      startHero();
    }

    if (slides.length) {
      showSlide(0);
      startHero();
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(currentSlide + 1);
        restartHero();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        showSlide(currentSlide - 1);
        restartHero();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        restartHero();
      });
    });

    var searchPage = document.querySelector("[data-search-page]");

    if (searchPage) {
      var input = searchPage.querySelector("[data-search-input]");
      var categorySelect = searchPage.querySelector("[data-category-filter]");
      var yearSelect = searchPage.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(searchPage.querySelectorAll("[data-movie-card]"));
      var resultLine = searchPage.querySelector("[data-result-line]");
      var emptyState = searchPage.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);

      if (input && params.get("q")) {
        input.value = params.get("q");
      }

      if (categorySelect && params.get("cat")) {
        categorySelect.value = params.get("cat");
      }

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilters() {
        var query = normalize(input ? input.value : "");
        var category = categorySelect ? categorySelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-year"));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesCategory = !category || card.getAttribute("data-category") === category;
          var matchesYear = !year || card.getAttribute("data-year") === year;
          var shouldShow = matchesQuery && matchesCategory && matchesYear;

          card.style.display = shouldShow ? "flex" : "none";

          if (shouldShow) {
            visible += 1;
          }
        });

        if (resultLine) {
          resultLine.textContent = "当前匹配 " + visible + " 部影片";
        }

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilters);
      }

      if (categorySelect) {
        categorySelect.addEventListener("change", applyFilters);
      }

      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilters);
      }

      applyFilters();
    }
  });
})();
