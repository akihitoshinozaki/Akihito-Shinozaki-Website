// Gentle reveal-on-scroll. Respects prefers-reduced-motion via CSS.
(function () {
  var targets = document.querySelectorAll(".section, .hero-text, .hero-side");
  targets.forEach(function (el) { el.classList.add("reveal"); });

  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  targets.forEach(function (el) { observer.observe(el); });
})();
