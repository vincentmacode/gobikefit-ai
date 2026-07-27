/* GoBikeFit — scroll reveal.
   The only script on the site. Loaded without defer so the .js class lands
   before first paint; without it depth.css leaves .reveal elements hidden. */

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
});
