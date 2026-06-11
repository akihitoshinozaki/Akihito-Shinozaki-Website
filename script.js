// ============================================================
// Akihito Shinozaki — site interactions
// All effects respect prefers-reduced-motion.
// ============================================================
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 1. Scroll progress bar ----------
  var bar = document.getElementById("progressBar");
  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }
  if (bar && !reduceMotion) {
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  // ---------- 2. Typewriter (hero) ----------
  var phrases = [
    "machine learning for healthcare",
    "mmWave radar → fall detection",
    "medical imaging · PyTorch",
    "multi-agent systems · LangGraph",
    "Tokyo → London → New York → Minneapolis"
  ];
  var tw = document.getElementById("typewriter");
  if (tw && !reduceMotion) {
    var pi = 0, ci = phrases[0].length, deleting = true, started = false;
    function tick() {
      var word = phrases[pi];
      if (deleting) {
        ci--;
        tw.textContent = word.slice(0, ci);
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
        setTimeout(tick, 28);
      } else {
        word = phrases[pi];
        ci++;
        tw.textContent = word.slice(0, ci);
        if (ci === word.length) {
          deleting = true;
          setTimeout(tick, 2200);
        } else {
          setTimeout(tick, 46);
        }
      }
    }
    // hold the first phrase, then begin cycling
    setTimeout(function () { if (!started) { started = true; tick(); } }, 2600);
  }

  // ---------- 3. Staggered scroll reveals ----------
  var staggers = document.querySelectorAll(".stagger");
  // assign per-sibling delays within each parent
  var groups = new Map();
  staggers.forEach(function (el) {
    var parent = el.parentElement;
    var n = groups.get(parent) || 0;
    el.style.setProperty("--d", Math.min(n * 0.09, 0.45) + "s");
    groups.set(parent, n + 1);
  });

  if (!("IntersectionObserver" in window) || reduceMotion) {
    staggers.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    staggers.forEach(function (el) { revealObs.observe(el); });
  }

  // ---------- 4. Active nav highlight ----------
  var navLinks = document.querySelectorAll(".topnav a[data-nav]");
  var sections = ["about", "experience", "projects", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.toggle("active", a.dataset.nav === entry.target.id);
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  // ---------- 5. Radar signal canvas (hero backdrop) ----------
  var canvas = document.getElementById("radar");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, t = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    var inkFaint = "rgba(27, 36, 48, 0.10)";
    var sealFaint = "rgba(194, 64, 47, 0.16)";

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // concentric radar arcs, lower-right anchored
      var cx = w * 0.86, cy = h * 0.92;
      var maxR = Math.hypot(w, h) * 0.55;
      for (var i = 0; i < 5; i++) {
        var phase = (t * 0.0009 + i / 5) % 1;
        var r = phase * maxR;
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, Math.PI * 2);
        ctx.strokeStyle = i % 3 === 0 ? sealFaint : inkFaint;
        ctx.globalAlpha = 1 - phase;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // quiet signal waveform across the bottom
      ctx.beginPath();
      var baseY = h * 0.88;
      for (var x = 0; x <= w; x += 4) {
        var y = baseY
          + Math.sin(x * 0.012 + t * 0.0016) * 7
          + Math.sin(x * 0.027 - t * 0.0011) * 4;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = inkFaint;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      t += 16;
      if (running) requestAnimationFrame(draw);
    }

    // pause when hero is off-screen to save battery
    var running = false;
    var heroObs = new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !running) { running = true; requestAnimationFrame(draw); }
      if (!visible) running = false;
    });
    heroObs.observe(canvas);
  }
})();
