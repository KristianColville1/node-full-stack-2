/**
 * App script. Runs on every page.
 * Navbar: spinner hamburger toggles mobile dropdown (Bulma navbar-menu).
 */
(function () {
  function initNavBurger() {
    var burger = document.getElementById('navBurger');
    var menu = document.getElementById('navMenu');
    if (!burger || !menu) return;
    burger.addEventListener('click', function () {
      burger.classList.toggle('is-active');
      menu.classList.toggle('is-active');
      burger.setAttribute('aria-expanded', burger.classList.contains('is-active'));
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavBurger);
  } else {
    initNavBurger();
  }
})();
