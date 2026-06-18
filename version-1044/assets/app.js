(function () {
    const body = document.body;

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMenu() {
        const toggle = document.querySelector("[data-menu-toggle]");
        const nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            body.classList.toggle("nav-open");
        });
        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                body.classList.remove("nav-open");
            });
        });
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                const input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    location.href = "./search.html";
                }
            });
        });
    }

    function filterCards(input, list) {
        const query = normalize(input.value);
        const terms = query.split(/\s+/).filter(Boolean);
        list.querySelectorAll(".movie-card").forEach(function (card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.region,
                card.dataset.tags,
                card.textContent
            ].join(" "));
            const matched = terms.every(function (term) {
                return haystack.indexOf(term) !== -1;
            });
            card.classList.toggle("is-hidden", !matched);
        });
    }

    function initFilters() {
        document.querySelectorAll("[data-local-filter]").forEach(function (input) {
            const key = input.getAttribute("data-local-filter");
            const list = document.querySelector("[data-filter-list='" + key + "']");
            if (!list) {
                return;
            }
            input.addEventListener("input", function () {
                filterCards(input, list);
            });
        });
        const queryInput = document.querySelector("[data-query-input]");
        const list = document.querySelector("[data-filter-list='search-list']");
        if (queryInput && list) {
            const params = new URLSearchParams(location.search);
            const value = params.get("q") || "";
            queryInput.value = value;
            if (value) {
                filterCards(queryInput, list);
            }
        }
    }

    function initHero() {
        const slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        let index = 0;
        let timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            clearInterval(timer);
            start();
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        start();
    }

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (window.__hlsLoading) {
            return window.__hlsLoading;
        }
        window.__hlsLoading = new Promise(function (resolve, reject) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return window.__hlsLoading;
    }

    function safePlay(video) {
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    function startVideo(player, video, button) {
        const source = video.getAttribute("data-hls-source");
        if (!source) {
            return;
        }
        player.classList.add("is-playing");
        if (button) {
            button.setAttribute("disabled", "disabled");
        }
        if (video.dataset.ready === "true") {
            safePlay(video);
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.dataset.ready = "true";
            safePlay(video);
            return;
        }
        loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                const hls = new Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.dataset.ready = "true";
                    safePlay(video);
                });
                video._hls = hls;
            } else {
                video.src = source;
                video.dataset.ready = "true";
                safePlay(video);
            }
        }).catch(function () {
            video.src = source;
            video.dataset.ready = "true";
            safePlay(video);
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            const video = player.querySelector("video");
            const button = player.querySelector("[data-play-button]");
            if (!video) {
                return;
            }
            if (button) {
                button.addEventListener("click", function () {
                    startVideo(player, video, button);
                });
            }
            video.addEventListener("click", function () {
                if (video.dataset.ready !== "true") {
                    startVideo(player, video, button);
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
        });
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initFilters();
        initHero();
        initPlayers();
    });
})();
