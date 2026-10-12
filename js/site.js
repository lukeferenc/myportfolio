(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const ready = () => root.classList.add("is-ready");
  if (reduceMotion) {
    ready();
  } else {
    window.addEventListener("load", () => setTimeout(ready, 350), { once: true });
    setTimeout(ready, 2500);
  }

  const revealables = document.querySelectorAll(".reveal, .reveal-frame");
  if ("IntersectionObserver" in window) {
    const revealer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    revealables.forEach((el) => revealer.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-in"));
  }

  const sectionLabel = document.querySelector("[data-section-label]");
  const sections = document.querySelectorAll("[data-section]");
  if (sectionLabel && "IntersectionObserver" in window) {
    const tracker = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) sectionLabel.textContent = entry.target.dataset.section;
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    sections.forEach((el) => tracker.observe(el));

    const footer = document.querySelector(".site-footer");
    if (footer) {
      new IntersectionObserver(([entry]) => {
        root.classList.toggle("at-end", entry.isIntersecting);
      }).observe(footer);
    }
  }

  const parallax = reduceMotion ? [] : Array.from(document.querySelectorAll("[data-parallax]"));
  if (parallax.length) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallax.forEach((img) => {
        const rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        img.style.setProperty("--py", `${(progress * -4).toFixed(2)}%`);
      });
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  if (!finePointer) return;

  const lerpFollower = (el) => {
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let running = false;
    const step = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) {
        requestAnimationFrame(step);
      } else {
        running = false;
      }
    };
    return {
      moveTo(nx, ny, snap) {
        tx = nx;
        ty = ny;
        if (snap || reduceMotion) {
          x = nx;
          y = ny;
        }
        if (!running) {
          running = true;
          requestAnimationFrame(step);
        }
      },
    };
  };

  const cursor = document.querySelector(".cursor");
  if (cursor) {
    const label = cursor.querySelector("span");
    const follower = lerpFollower(cursor);
    document.querySelectorAll("[data-cursor]").forEach((target) => {
      target.addEventListener("mouseenter", (e) => {
        label.textContent = target.dataset.cursor;
        follower.moveTo(e.clientX, e.clientY, true);
        cursor.classList.add("is-on");
      });
      target.addEventListener("mousemove", (e) => follower.moveTo(e.clientX, e.clientY));
      target.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
    });
  }
})();
