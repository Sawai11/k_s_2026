(function () {
  function initNavigation() {
    const burgerButtons = document.querySelectorAll(".navbar-burger");

    burgerButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const targetId = button.dataset.target;
        const targetMenu = targetId ? document.getElementById(targetId) : null;

        if (!targetMenu) {
          return;
        }

        button.classList.toggle("is-active");
        targetMenu.classList.toggle("is-active");
      });
    });
  }

  function initSmoothScroll() {
    $(document).on("click", 'a[href^="#"]', function (event) {
      const targetId = $(this).attr("href");
      if (!targetId || targetId === "#") {
        return;
      }

      const target = $(targetId);
      if (!target.length) {
        return;
      }

      event.preventDefault();
      $("html, body").animate({ scrollTop: target.offset().top }, 500);
    });
  }

  function initScrollToTop() {
    const toTopButton = document.getElementById("toTop");
    if (!toTopButton) {
      return;
    }

    const updateButtonVisibility = function () {
      const scrolled = document.body.scrollTop > 20 || document.documentElement.scrollTop > 20;
      toTopButton.style.display = scrolled ? "block" : "none";
    };

    window.addEventListener("scroll", updateButtonVisibility, { passive: true });
    updateButtonVisibility();
  }

  function initPreloader() {
    $(window).on("load", function () {
      $(".preloader-wrapper").fadeOut();
      $("body").removeClass("preloader-site");
    });
  }

  function initMusicPlayer() {
    const player = document.getElementById("miniMusic");
    const fab = document.getElementById("musicFab");
    const audio = document.getElementById("weddingAudio");
    const track = document.getElementById("musicTrack");
    const playBtn = document.getElementById("musicPlay");
    const muteBtn = document.getElementById("musicMute");
    const speaker = document.getElementById("speakerIcon");
    const status = document.getElementById("musicStatus");
    const menu = document.getElementById("musicMenu");

    if (!player || !fab || !audio || !track || !playBtn || !muteBtn || !speaker || !status || !menu) {
      return;
    }

    let isMuted = false;
    let closeTimer = null;

    const setStatus = function (message) {
      status.textContent = message;
    };

    const updatePlayButton = function () {
      playBtn.textContent = audio.paused ? "▶" : "Ⅱ";
    };

    const reopenMenu = function () {
      player.classList.add("menu-open");
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () {
        player.classList.remove("menu-open");
      }, 4500);
    };

    const startAudio = async function (showMenu) {
      try {
        await audio.play();
        setStatus("Now playing");
        updatePlayButton();
        if (showMenu !== false) {
          reopenMenu();
        }
      } catch (error) {
        setStatus("Tap anywhere to start music");
        updatePlayButton();
      }
    };

    audio.volume = 0.7;
    audio.preload = "auto";

    const startOnFirstInteraction = function (event) {
      const isScrollGesture = event.type === "scroll" || event.type === "wheel" || event.type === "touchstart";
      if (!isScrollGesture && player.contains(event.target)) {
        return;
      }

      startAudio(false).then(function () {
        if (!audio.paused) {
          document.removeEventListener("pointerdown", startOnFirstInteraction);
          document.removeEventListener("keydown", startOnFirstInteraction);
          window.removeEventListener("scroll", startOnFirstInteraction);
          document.removeEventListener("wheel", startOnFirstInteraction);
          document.removeEventListener("touchstart", startOnFirstInteraction);
        }
      });
    };

    document.addEventListener("pointerdown", startOnFirstInteraction);
    document.addEventListener("keydown", startOnFirstInteraction);
    document.addEventListener("wheel", startOnFirstInteraction, { passive: true });
    document.addEventListener("touchstart", startOnFirstInteraction, { passive: true });
    window.addEventListener("scroll", startOnFirstInteraction, { passive: true });
    startAudio(false);

    fab.addEventListener("click", function (event) {
      event.stopPropagation();
      player.classList.toggle("menu-open");

      if (player.classList.contains("menu-open") && audio.paused && !isMuted) {
        startAudio();
      }
    });

    menu.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    playBtn.addEventListener("click", async function () {
      if (audio.paused) {
        try {
          await audio.play();
          setStatus("Now playing");
        } catch (error) {
          setStatus("Tap play to start");
        }
      } else {
        audio.pause();
        setStatus("Paused");
      }

      updatePlayButton();
      reopenMenu();
    });

    muteBtn.addEventListener("click", function () {
      isMuted = !isMuted;
      audio.muted = isMuted;

      const icon = isMuted ? "🔇" : "🔊";
      muteBtn.textContent = icon;
      speaker.textContent = icon;
      setStatus(isMuted ? "Muted" : "Now playing");
      reopenMenu();
    });

    track.addEventListener("change", async function () {
      const wasPlaying = !audio.paused;
      audio.pause();
      audio.src = track.value;
      audio.load();
      audio.currentTime = 0;
      setStatus("Song selected");

      if (wasPlaying || player.classList.contains("menu-open")) {
        try {
          await audio.play();
          setStatus("Now playing");
        } catch (error) {
          setStatus("Tap play to start");
        }
      }

      updatePlayButton();
    });

    player.addEventListener("mouseleave", function () {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () {
        player.classList.remove("menu-open");
      }, 4500);
    });

    player.addEventListener("mouseenter", function () {
      clearTimeout(closeTimer);
    });

    audio.addEventListener("play", updatePlayButton);
    audio.addEventListener("pause", updatePlayButton);
    audio.addEventListener("error", function () {
      setStatus("Audio not available");
    });
  }

  function initScratchReveal() {
    const wrap = document.getElementById("heartScratchWrap");
    const overlay = document.getElementById("heartScratchOverlay");
    const canvas = document.getElementById("heartScratchCanvas");
    const countdown = document.getElementById("revealedCountdown");

    if (!wrap || !overlay || !canvas || !countdown) {
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return;
    }

    let isScratching = false;
    let isRevealed = false;
    let lastPoint = null;
    let pointerId = null;
    let resizeTimer = null;
    let moveCount = 0;

    function drawGoldCoating() {
      if (isRevealed) {
        return;
      }

      const rect = overlay.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, rect.width, rect.height);

      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, "#FFFDF7");
      gradient.addColorStop(0.18, "#F9E8B7");
      gradient.addColorStop(0.4, "#EFCB71");
      gradient.addColorStop(0.62, "#D9A84A");
      gradient.addColorStop(0.82, "#F5DF9B");
      gradient.addColorStop(1, "#FFF2C9");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      for (let i = 0; i < rect.width * rect.height / 110; i += 1) {
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        const alpha = Math.random() * 0.14;
        ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
        ctx.fillRect(x, y, 1.6, 1.6);
      }

      const shine = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      shine.addColorStop(0, "rgba(255,255,255,.8)");
      shine.addColorStop(0.22, "rgba(255,255,255,.2)");
      shine.addColorStop(0.52, "rgba(255,229,167,.1)");
      shine.addColorStop(1, "rgba(255,255,255,.25)");
      ctx.fillStyle = shine;
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.globalCompositeOperation = "destination-out";
    }

    function pointFrom(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function scratch(point) {
      if (!lastPoint) {
        lastPoint = point;
        ctx.beginPath();
        ctx.arc(point.x, point.y, Math.max(13, wrap.clientWidth * 0.06), 0, Math.PI * 2);
        ctx.fill();
        moveCount += 1;
        if (moveCount % 2 === 0) {
          checkScratchProgress();
        }
        return;
      }

      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = Math.max(18, wrap.clientWidth * 0.09);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      lastPoint = point;

      moveCount += 1;
      if (moveCount % 2 === 0) {
        checkScratchProgress();
      }
    }

    function reveal() {
      if (isRevealed) {
        return;
      }

      isRevealed = true;
      isScratching = false;
      overlay.classList.add("is-revealed");
      countdown.classList.add("is-visible");
      countdown.setAttribute("aria-hidden", "false");
      updateCountdown();
    }

    function checkScratchProgress() {
      if (isRevealed) {
        return;
      }

      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      let sampled = 0;

      for (let i = 3; i < pixels.length; i += 4 * 16) {
        sampled += 1;
        if (pixels[i] < 40) {
          clear += 1;
        }
      }

      if (sampled && clear / sampled >= 0.15) {
        reveal();
      }
    }

    overlay.addEventListener("pointerdown", function (event) {
      if (isRevealed) {
        return;
      }

      event.preventDefault();
      isScratching = true;
      pointerId = event.pointerId;
      moveCount = 0;
      lastPoint = null;
      overlay.setPointerCapture(event.pointerId);
      scratch(pointFrom(event));
    });

    overlay.addEventListener("pointermove", function (event) {
      if (!isScratching || isRevealed || event.pointerId !== pointerId) {
        return;
      }

      event.preventDefault();
      scratch(pointFrom(event));
    });

    function stopScratch(event) {
      if (!isScratching) {
        return;
      }

      isScratching = false;
      lastPoint = null;

      if (event && overlay.hasPointerCapture && overlay.hasPointerCapture(event.pointerId)) {
        overlay.releasePointerCapture(event.pointerId);
      }

      checkScratchProgress();
    }

    overlay.addEventListener("pointerup", stopScratch);
    overlay.addEventListener("pointercancel", stopScratch);

    const resizeObserver = new ResizeObserver(function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawGoldCoating, 120);
    });

    resizeObserver.observe(overlay);
    drawGoldCoating();

    const targetDate = new Date("2026-11-21T07:00:00+05:30").getTime();
    const fields = {
      days: document.querySelector("#weddingCountdown .days"),
      hours: document.querySelector("#weddingCountdown .hours"),
      minutes: document.querySelector("#weddingCountdown .minutes"),
      seconds: document.querySelector("#weddingCountdown .seconds")
    };

    function updateCountdown() {
      let remaining = Math.max(0, targetDate - Date.now());
      const days = Math.floor(remaining / 86400000);
      remaining %= 86400000;
      const hours = Math.floor(remaining / 3600000);
      remaining %= 3600000;
      const minutes = Math.floor(remaining / 60000);
      remaining %= 60000;
      const seconds = Math.floor(remaining / 1000);

      if (fields.days) {
        fields.days.textContent = String(days).padStart(2, "0");
      }
      if (fields.hours) {
        fields.hours.textContent = String(hours).padStart(2, "0");
      }
      if (fields.minutes) {
        fields.minutes.textContent = String(minutes).padStart(2, "0");
      }
      if (fields.seconds) {
        fields.seconds.textContent = String(seconds).padStart(2, "0");
      }
    }

    updateCountdown();
    setInterval(function () {
      if (isRevealed) {
        updateCountdown();
      }
    }, 1000);
  }

  function initAOS() {
    if (window.AOS) {
      window.AOS.init({
        easing: "ease-out",
        duration: 800
      });
    }
  }

  function bindGiftButton() {
    const copyButton = document.querySelector(".gift-copy-btn");
    if (!copyButton) {
      return;
    }

    copyButton.addEventListener("click", function () {
      const upiId = "theks21@slc";

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(upiId)
          .then(function () {
            alert("UPI ID copied: " + upiId);
          })
          .catch(function () {
            prompt("Copy your UPI ID:", upiId);
          });
      } else {
        prompt("Copy your UPI ID:", upiId);
      }
    });
  }

  function init() {
    initNavigation();
    initSmoothScroll();
    initScrollToTop();
    initPreloader();
    initMusicPlayer();
    initScratchReveal();
    initAOS();
    bindGiftButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

function copyWeddingUPI() {
  const upiId = "theks21@slc";

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(upiId)
      .then(function () {
        alert("UPI ID copied: " + upiId);
      })
      .catch(function () {
        prompt("Copy your UPI ID:", upiId);
      });
  } else {
    prompt("Copy your UPI ID:", upiId);
  }
}
