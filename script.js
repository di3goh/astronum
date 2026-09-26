document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

document.querySelectorAll('a[href$=".html"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (link.target === '_blank' || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    document.body.classList.add('is-leaving');
    window.setTimeout(() => { window.location.href = link.href; }, 260);
  });
});

const openModal = (modal) => { modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); };
const closeModal = (modal) => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); };
const toast = document.querySelector('.toast');
document.querySelector('.write-trigger')?.addEventListener('click', (event) => { event.preventDefault(); toast.classList.add('is-visible'); window.clearTimeout(window.__toastTimer); window.__toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800); });
document.querySelectorAll('.story-trigger').forEach((trigger) => trigger.addEventListener('click', (event) => { event.preventDefault(); openModal(document.querySelector('.story-modal')); }));
document.querySelectorAll('.auth-trigger').forEach((trigger) => trigger.addEventListener('click', (event) => { event.preventDefault(); const modal = document.querySelector('.auth-modal'); modal.querySelector('.auth-title').textContent = trigger.dataset.mode === 'register' ? 'Crea tu cuenta' : 'Bienvenido'; modal.querySelector('.auth-subtitle').textContent = trigger.dataset.mode === 'register' ? 'Regístrate en Astronum para empezar a leer' : 'Ingresa a Astronum para empezar a leer'; modal.querySelector('.auth-submit').firstChild.textContent = trigger.dataset.mode === 'register' ? 'Registrarme ' : 'Ingresar '; openModal(modal); }));
document.querySelectorAll('.modal-close').forEach((button) => button.addEventListener('click', () => closeModal(button.closest('.overlay-modal'))));
document.querySelectorAll('.overlay-modal').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); }));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') document.querySelectorAll('.overlay-modal.is-open').forEach(closeModal); });

const hero = document.querySelector('.hero');
const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (hero && motionAllowed) {
  let frameId;
  let pointerX = 0;
  let pointerY = 0;

  const updateGradient = () => {
    hero.style.setProperty('--mouse-x', pointerX.toFixed(3));
    hero.style.setProperty('--mouse-y', pointerY.toFixed(3));
    hero.style.setProperty('--spot-x', `${((pointerX + 1) * 50).toFixed(1)}%`);
    hero.style.setProperty('--spot-y', `${((pointerY + 1) * 50).toFixed(1)}%`);
    frameId = undefined;
  };

  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    pointerY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    if (!frameId) frameId = requestAnimationFrame(updateGradient);
  });

  hero.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0;
    if (!frameId) frameId = requestAnimationFrame(updateGradient);
  });
}
