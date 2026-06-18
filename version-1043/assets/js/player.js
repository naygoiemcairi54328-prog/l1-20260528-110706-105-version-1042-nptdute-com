(function () {
    window.createMoviePlayer = function (videoId, overlayId, buttonId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var button = document.getElementById(buttonId);
        var message = document.querySelector("[data-player-message]");
        var hls = null;
        var attached = false;
        var shouldPlay = false;

        if (!video || !overlay || !button || !source) {
            return;
        }

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add("is-visible");
        }

        function hideMessage() {
            if (!message) {
                return;
            }
            message.textContent = "";
            message.classList.remove("is-visible");
        }

        function attemptPlay() {
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        function attachSource() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    if (shouldPlay) {
                        attemptPlay();
                    }
                }, { once: true });
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    hideMessage();
                    if (shouldPlay) {
                        attemptPlay();
                    }
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        showMessage("播放连接暂时不可用");
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        showMessage("播放暂时中断，正在恢复");
                        hls.recoverMediaError();
                    } else {
                        showMessage("当前影片暂时无法播放");
                        hls.destroy();
                    }
                });
                return;
            }

            showMessage("当前浏览器暂时无法播放");
        }

        function start() {
            shouldPlay = true;
            hideMessage();
            attachSource();
            overlay.classList.add("is-hidden");
            video.controls = true;
            attemptPlay();
        }

        overlay.addEventListener("click", start);
        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });
        video.addEventListener("playing", function () {
            overlay.classList.add("is-hidden");
            hideMessage();
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
