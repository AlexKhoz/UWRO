document.addEventListener('DOMContentLoaded', function () {
  const burger = document.getElementById('nav-icon');
  const sidenav = document.getElementById('mySidenav');

  if (!burger || !sidenav) return;

  burger.addEventListener('click', function (e) {
    e.preventDefault();
    // Toggle icon animation
    burger.classList.toggle('open');

    // Toggle menu panel width
    const isOpen = sidenav.style.width === '450px';
    sidenav.style.width = isOpen ? '0' : '450px';
  });
});