(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        const button = document.querySelector("[data-menu-button]");
        const nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const next = hero.querySelector("[data-hero-next]");
        const prev = hero.querySelector("[data-hero-prev]");
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                play();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                play();
            });
        }
        show(0);
        play();
    }

    function setupSearch() {
        const panel = document.querySelector("[data-search-panel]");
        if (!panel) {
            return;
        }
        const input = panel.querySelector(".site-search");
        const form = panel.querySelector("[data-local-search]");
        const chips = Array.from(panel.querySelectorAll("[data-filter]"));
        const cards = Array.from(document.querySelectorAll("[data-card]"));
        let chipTerm = "";

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.textContent
            ].join(" "));
        }

        function apply() {
            const query = normalize(input ? input.value : "");
            const terms = normalize(chipTerm).split(/\s+/).filter(Boolean);
            cards.forEach(function (card) {
                const text = cardText(card);
                const matchQuery = !query || text.includes(query);
                const matchChip = !terms.length || terms.some(function (term) {
                    return text.includes(term);
                });
                card.classList.toggle("is-hidden", !(matchQuery && matchChip));
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (form) {
            form.addEventListener("submit", function (event) {
                if (cards.length) {
                    event.preventDefault();
                    apply();
                }
            });
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                chip.classList.add("is-active");
                chipTerm = chip.getAttribute("data-filter") || "";
                apply();
            });
        });
    }

    window.initPlayer = function (source) {
        const video = document.getElementById("movieVideo");
        const overlay = document.querySelector("[data-player-overlay]");
        if (!video || !source) {
            return;
        }
        let prepared = false;

        function attach() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = source;
            }
        }

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("loadedmetadata", function () {
            if (!video.paused && overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();
