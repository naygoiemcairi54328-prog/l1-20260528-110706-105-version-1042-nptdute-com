document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-main-nav]");

    if (menuButton && menu) {
        menuButton.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("img[data-cover-img]").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("cover-hidden");
        });
    });

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        let activeIndex = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, currentIndex) {
                slide.classList.toggle("is-active", currentIndex === activeIndex);
            });
            dots.forEach(function (dot, currentIndex) {
                dot.classList.toggle("is-active", currentIndex === activeIndex);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        }
    });

    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
        input.addEventListener("input", function () {
            const scope = input.getAttribute("data-filter-scope");
            const list = document.querySelector('[data-filter-list="' + scope + '"]');
            if (!list) {
                return;
            }
            const keyword = input.value.trim().toLowerCase();
            list.querySelectorAll(".movie-item").forEach(function (item) {
                const text = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
                item.classList.toggle("is-filter-hidden", keyword && !text.includes(keyword));
            });
        });
    });

    document.querySelectorAll("[data-sort-select]").forEach(function (select) {
        select.addEventListener("change", function () {
            const scope = select.getAttribute("data-filter-scope");
            const list = document.querySelector('[data-filter-list="' + scope + '"]');
            if (!list) {
                return;
            }
            const items = Array.from(list.querySelectorAll(".movie-item"));
            const mode = select.value;
            const original = new Map(items.map(function (item, index) {
                return [item, index];
            }));

            items.sort(function (a, b) {
                const yearA = Number(a.getAttribute("data-year") || 0);
                const yearB = Number(b.getAttribute("data-year") || 0);
                const titleA = a.getAttribute("data-title") || "";
                const titleB = b.getAttribute("data-title") || "";

                if (mode === "year-asc") {
                    return yearA - yearB || titleA.localeCompare(titleB, "zh-Hans-CN");
                }
                if (mode === "title-asc") {
                    return titleA.localeCompare(titleB, "zh-Hans-CN") || yearB - yearA;
                }
                if (mode === "default") {
                    return original.get(a) - original.get(b);
                }
                return yearB - yearA || titleA.localeCompare(titleB, "zh-Hans-CN");
            });

            items.forEach(function (item) {
                list.appendChild(item);
            });
        });
    });
});
