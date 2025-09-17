document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("locale-button");
  const menu = document.getElementById("locale-menu");
  if (!button || !menu) return;

  function openMenu() {
    button.setAttribute("aria-expanded", "true");
    menu.classList.add("is-open");
    const firstItem = menu.querySelector('[role="menuitem"]');
    if (firstItem) firstItem.focus();
    document.body.classList.add("no-scroll");
  }

  function closeMenu() {
    button.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    button.focus();
    document.body.classList.remove("no-scroll");
  }

  function toggleMenu() {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMenu();
    else openMenu();
  }

  // Mark current locale item (best-effort by pathname)
  try {
    const path = (location.pathname || "/").toLowerCase();
    const match = path.match(/^\/(\w{2})(\/|$)/);
    const code = match ? match[1] : "en";
    const current = menu.querySelector(`a[lang="${code}"]`);
    if (current) current.setAttribute("aria-current", "true");
  } catch (_) {}

  button.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  // Click outside to close (desktop)
  document.addEventListener("click", function (e) {
    if (!menu.classList.contains("is-open")) return;
    if (menu.contains(e.target) || button.contains(e.target)) return;
    closeMenu();
  });

  // Keyboard interactions
  document.addEventListener("keydown", function (e) {
    if (!menu.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      return;
    }

    const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    if (!items.length) return;
    const active = document.activeElement;
    const idx = items.indexOf(active);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[(idx + 1 + items.length) % items.length];
      next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[(idx - 1 + items.length) % items.length];
      prev.focus();
    }
  });
});
