(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function restartHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
            startHero();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restartHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restartHero();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restartHero();
            });
        });

        startHero();

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-filter-region]");
            var year = scope.querySelector("[data-filter-year]");
            var type = scope.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .compact-card"));
            var empty = scope.querySelector("[data-no-result]");

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : "";
            }

            function filterCards() {
                var query = valueOf(input);
                var regionValue = valueOf(region);
                var yearValue = valueOf(year);
                var typeValue = valueOf(type);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
                    var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
                    var cardType = (card.getAttribute("data-type") || "").toLowerCase();
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, year, type].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", filterCards);
                    element.addEventListener("change", filterCards);
                }
            });
        });
    });
})();
