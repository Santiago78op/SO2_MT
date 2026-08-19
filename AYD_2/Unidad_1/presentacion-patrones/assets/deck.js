/* ============================================================
   deck.js — navegación de diapositivas + tema claro/oscuro.
   Compartido por todas las páginas: en el índice (sin .stage)
   solo activa el botón de tema.
   ============================================================ */

/* ---- tema: respeta el sistema hasta que el usuario toca ◐; se recuerda ---- */
(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem('df-theme');
  if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;

  const btn = document.getElementById('theme');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const nuevo = dark ? 'light' : 'dark';
    root.dataset.theme = nuevo;
    localStorage.setItem('df-theme', nuevo);
  });
})();

/* ---- navegación de slides (solo si la página es un deck) ---- */
(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  if (!slides.length) return;

  const cur = document.getElementById('cur');
  const tot = document.getElementById('tot');
  const bar = document.getElementById('bar');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const stage = document.querySelector('.stage');
  let i = 0;
  tot.textContent = slides.length;

  function show(n) {
    /* dirección de la navegación: orienta la cascada de entrada (CSS --rise-y) */
    if (stage) stage.classList.toggle('back', n < i);
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    cur.textContent = i + 1;
    bar.style.width = ((i + 1) / slides.length * 100) + '%';
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    slides[i].scrollTop = 0;
  }
  prev.addEventListener('click', () => show(i - 1));
  next.addEventListener('click', () => show(i + 1));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); show(i + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(i - 1); }
  });
  show(0);
})();

/* ============================================================
   Revelado por pasos de los diagramas (Motion, opcional).
   Cualquier elemento con [data-step] dentro de una diapositiva
   aparece en orden cuando la diapositiva se activa.
   Si motion.js no cargo o el usuario pidio menos movimiento,
   no se anima nada y todo queda visible: es puramente aditivo.
   ============================================================ */
(function () {
  const M = window.Motion;
  const stage = document.querySelector('.stage');
  if (!M || !M.animate || !stage) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function revelar(slide) {
    const pasos = slide.querySelectorAll('[data-step]');
    if (!pasos.length) return;
    pasos.forEach((g, k) => {
      M.animate(g, { opacity: [0, 1] },
                { duration: .32, delay: .70 + k * .22, ease: 'easeOut' });
    });
  }

  new MutationObserver((muts) => {
    muts.forEach((m) => {
      if (m.attributeName === 'class' && m.target.classList.contains('active')) {
        revelar(m.target);
      }
    });
  }).observe(stage, { subtree: true, attributes: true, attributeFilter: ['class'] });

  const activa = document.querySelector('.slide.active');
  if (activa) revelar(activa);
})();
