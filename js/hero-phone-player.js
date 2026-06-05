(function () {
  var VIDEO_URL = "https://phqxkdqagdzybjboadfh.supabase.co/storage/v1/object/public/Duck%20dodgers/Pato%20Donald";

  function $(id) {
    return document.getElementById(id);
  }

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
  }

  function videoEl() {
    return $("heroPhoneVideo");
  }

  function setPlayingUi(playing) {
    var btn = $("heroPhoneToggle");
    if (!btn) return;
    var pauseIcon = btn.querySelector(".hero-phone-icon-pause");
    var playIcon = btn.querySelector(".hero-phone-icon-play");
    if (pauseIcon) pauseIcon.classList.toggle("hero-phone-ctrl--hidden", !playing);
    if (playIcon) playIcon.classList.toggle("hero-phone-ctrl--hidden", playing);
    btn.setAttribute("aria-label", playing ? "Pausar vídeo" : "Reproduzir vídeo");
  }

  function setMutedUi(muted) {
    var btn = $("heroPhoneMute");
    if (!btn) return;
    var mutedIcon = btn.querySelector(".hero-phone-icon-muted");
    var unmutedIcon = btn.querySelector(".hero-phone-icon-unmuted");
    if (mutedIcon) mutedIcon.classList.toggle("hero-phone-ctrl--hidden", !muted);
    if (unmutedIcon) unmutedIcon.classList.toggle("hero-phone-ctrl--hidden", muted);
    btn.setAttribute("aria-label", muted ? "Ativar som" : "Desativar som");
  }

  function updateUi() {
    var video = videoEl();
    var timeEl = $("heroPhoneTime");
    var fill = $("heroPhoneProgressFill");
    var progress = $("heroPhoneProgress");
    if (!video) return;
    if (timeEl) {
      var d = video.duration;
      timeEl.textContent =
        fmt(video.currentTime) + " / " + (d && isFinite(d) ? fmt(d) : "0:00");
    }
    var dur = video.duration;
    var pct = dur && isFinite(dur) && dur > 0 ? Math.min(100, (video.currentTime / dur) * 100) : 0;
    if (fill) fill.style.width = pct + "%";
    if (progress) progress.setAttribute("aria-valuenow", String(Math.round(pct)));
    setPlayingUi(!video.paused);
    setMutedUi(video.muted);
  }

  function stopEvent(e) {
    if (!e) return;
    e.preventDefault();
    e.stopPropagation();
  }

  function engageQuiet() {
    var media = $("heroPhoneMedia");
    var overlay = $("heroPhoneOverlay");
    if (!media || media.classList.contains("is-engaged")) return;
    media.classList.add("is-engaged");
    if (overlay) overlay.classList.add("is-hidden");
  }

  function playVideo(unmute) {
    var video = videoEl();
    if (!video) return;
    if (unmute) {
      video.muted = false;
      setMutedUi(false);
    }
    var p = video.play();
    if (p && p.catch) {
      p.catch(function () {
        video.muted = true;
        setMutedUi(true);
        video.play().catch(function () {});
      });
    }
    updateUi();
  }

  window.heroPhoneStart = function (e) {
    stopEvent(e);
    engageQuiet();
    var video = videoEl();
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    playVideo(true);
    return false;
  };

  window.heroPhoneToggle = function (e) {
    stopEvent(e);
    engageQuiet();
    var video = videoEl();
    if (!video) return false;
    if (video.paused) {
      playVideo(false);
    } else {
      video.pause();
      updateUi();
    }
    return false;
  };

  window.heroPhoneMute = function (e) {
    stopEvent(e);
    engageQuiet();
    var video = videoEl();
    if (!video) return false;
    video.muted = !video.muted;
    setMutedUi(video.muted);
    if (!video.muted && video.paused) playVideo(false);
    else updateUi();
    return false;
  };

  window.heroPhoneFullscreen = function (e) {
    stopEvent(e);
    engageQuiet();
    var media = $("heroPhoneMedia");
    var video = videoEl();
    if (!media && !video) return false;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(function () {});
    } else if (video && video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    } else if (media && media.requestFullscreen) {
      media.requestFullscreen().catch(function () {
        if (video && video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      });
    }
    return false;
  };

  window.heroPhoneSeek = function (e) {
    stopEvent(e);
    engageQuiet();
    var video = videoEl();
    var progress = $("heroPhoneProgress");
    if (!video || !progress || !video.duration || !isFinite(video.duration)) return false;
    var rect = progress.getBoundingClientRect();
    if (!rect.width) return false;
    var ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    updateUi();
    return false;
  };

  window.heroPhoneSeekDown = function (e) {
    stopEvent(e);
    engageQuiet();
    var progress = $("heroPhoneProgress");
    if (!progress) return false;
    window.heroPhoneSeek(e);
    function onMove(ev) {
      window.heroPhoneSeek(ev);
    }
    function onUp() {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    }
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    return false;
  };

  function bindControl(id, handler) {
    var el = $(id);
    if (!el) return;
    el.addEventListener("click", handler, true);
  }

  function initHeroPhone() {
    var video = videoEl();
    var media = $("heroPhoneMedia");
    if (!video || !media) return;

    video.src = VIDEO_URL;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("autoplay", "");
    video.preload = "auto";
    video.load();

    bindControl("heroPhoneToggle", window.heroPhoneToggle);
    bindControl("heroPhoneMute", window.heroPhoneMute);
    bindControl("heroPhoneFullscreen", window.heroPhoneFullscreen);
    bindControl("heroPhoneOverlay", window.heroPhoneStart);

    var progress = $("heroPhoneProgress");
    if (progress) {
      progress.addEventListener("click", window.heroPhoneSeek, true);
      progress.addEventListener("pointerdown", window.heroPhoneSeekDown, true);
    }

    ["loadedmetadata", "durationchange", "timeupdate", "play", "pause", "canplay", "playing"].forEach(function (ev) {
      video.addEventListener(ev, updateUi);
    });

    video.addEventListener("ended", function () {
      video.currentTime = 0;
      video.play().catch(function () {});
    });

    video.addEventListener("error", function () {
      var timeEl = $("heroPhoneTime");
      if (timeEl) timeEl.textContent = "Vídeo indisponível";
    });

    video.play().catch(function () {});
    updateUi();
    setInterval(updateUi, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroPhone);
  } else {
    initHeroPhone();
  }
})();
