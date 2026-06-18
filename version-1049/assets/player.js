function setupPlayer(streamUrl) {
    const video = document.getElementById("playerVideo");
    const cover = document.getElementById("playerCover");
    const button = document.getElementById("playerButton");
    let hlsInstance = null;
    let started = false;

    if (!video || !cover || !button || !streamUrl) {
        return;
    }

    function beginPlayback() {
        if (started) {
            cover.classList.add("is-hidden");
            video.play().catch(function () {});
            return;
        }

        started = true;
        cover.classList.add("is-hidden");

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal && hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    video.src = streamUrl;
                    video.play().catch(function () {});
                }
            });
            return;
        }

        video.src = streamUrl;
        video.play().catch(function () {});
    }

    button.addEventListener("click", beginPlayback);
    cover.addEventListener("click", beginPlayback);
    video.addEventListener("click", function () {
        if (video.paused) {
            beginPlayback();
        }
    });
}
