function initBackButton() {
  const btn = document.getElementById("back-btn") as HTMLAnchorElement | null;
  if (!btn) return;

  // Avoid double-initializing
  if (btn.dataset.init === "1") return;
  btn.dataset.init = "1";

  const url = new URL(window.location.href);
  const from = url.searchParams.get("from") || url.searchParams.get("back");

  if (from) {
    btn.setAttribute("href", "/#" + from);
  } else {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.history.back();
    });
  }
}

function initDragScroll(el: Element) {
  const htmlEl = el as HTMLElement;

  // Guard: only desktop
  if (window.innerWidth < 1024) return;

  // Guard: already initialized
  if (htmlEl.dataset.dragInit === "1") return;

  // Guard: not horizontally scrollable
  if (htmlEl.scrollWidth <= htmlEl.clientWidth) {
    htmlEl.dataset.dragInit = "1";
    return;
  }

  htmlEl.dataset.dragInit = "1";

  let down = false;
  let startX = 0;
  let startLeft = 0;
  let dragged = false;

  let raf = 0;
  let pendingLeft: number | null = null;

  const setLeft = (value: number) => {
    pendingLeft = value;
    if (!raf) {
      raf = requestAnimationFrame(() => {
        if (pendingLeft !== null) {
          htmlEl.scrollLeft = pendingLeft;
        }
        pendingLeft = null;
        raf = 0;
      });
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    down = true;
    dragged = false;
    startX = e.clientX;
    startLeft = htmlEl.scrollLeft;

    htmlEl.classList.add("dragging");
    try {
      htmlEl.setPointerCapture(e.pointerId);
    } catch {}
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!down) return;
    e.preventDefault();

    const dx = e.clientX - startX;
    if (!dragged && Math.abs(dx) > 2) dragged = true;

    setLeft(startLeft - dx);
  };

  const endDrag = (e: PointerEvent | null) => {
    if (!down) return;
    down = false;
    htmlEl.classList.remove("dragging");
    try {
      e && htmlEl.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const onClickCapture = (e: MouseEvent) => {
    if (dragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  htmlEl.addEventListener("pointerdown", onPointerDown as EventListener, {
    passive: true,
  });
  htmlEl.addEventListener("pointermove", onPointerMove as EventListener, {
    passive: false,
  });
  htmlEl.addEventListener("pointerup", endDrag as EventListener, {
    passive: true,
  });
  htmlEl.addEventListener("pointerleave", endDrag as EventListener, {
    passive: true,
  });
  htmlEl.addEventListener("pointercancel", endDrag as EventListener, {
    passive: true,
  });
  htmlEl.addEventListener("click", onClickCapture as EventListener, true);
}

function initAll() {
  // back button
  initBackButton();

  // drag scroll: only elements not yet initialized
  const scrollElements = document.querySelectorAll(
    ".no-scrollbar:not([data-drag-init='1'])",
  );
  scrollElements.forEach((el) => initDragScroll(el));
}

/** Call this once per page-load/swap. */
export function setupProjectEnhancements() {
  initAll();
}

// Auto-wire for Astro SPA lifecycle if you prefer “drop-in” usage:
export function attachAstroLifecycle() {
  const run = () => setupProjectEnhancements();

  document.addEventListener("astro:page-load", run);
  document.addEventListener("DOMContentLoaded", run);
  document.addEventListener("astro:after-swap", run);
}
