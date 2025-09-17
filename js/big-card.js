(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    const card = document.querySelector('.big-card-element');
    const icon = document.getElementById('icon-click');

    if (!card || !icon) return;

    const toggle = () => {
      card.classList.toggle('is-flipped');
      const flipped = card.classList.contains('is-flipped');
      const back = card.querySelector('.big-card-back');
      if (back) back.setAttribute('aria-hidden', flipped ? 'false' : 'true');
    };

    // Make both the icon and the entire card interactive
    icon.setAttribute('role', 'button');
    icon.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    // Click handlers
    icon.addEventListener('click', toggle);
    card.addEventListener('click', (e) => {
      // Avoid double toggles if the icon triggers first
      if (e.target === icon) return;
      toggle();
    });

    // Keyboard handlers
    const keyHandler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    };
    icon.addEventListener('keydown', keyHandler);
    card.addEventListener('keydown', keyHandler);
  });
})();
