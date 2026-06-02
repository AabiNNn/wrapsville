const aboutSection = document.querySelector('.about');
const wrapImages = document.querySelectorAll('.wrap-image');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      wrapImages.forEach((img) => img.classList.add('show'));
    }
  });
}, { threshold: 0.3 });

observer.observe(aboutSection);

