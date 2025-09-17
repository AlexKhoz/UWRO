const orgName = document.querySelector('.org-name');
const darkSection = document.getElementById('dark-section');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      orgName.style.color = 'white';
    } else {
      orgName.style.color = 'black';
    }
  });
}, {
  root: null,
  threshold: 0.5 // change when 50% of section is visible
});

observer.observe(darkSection);
