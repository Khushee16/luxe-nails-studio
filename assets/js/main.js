// Luxe Nails Studio — shared interactions
document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reducedMotion ? 'auto' : 'smooth';

  // Scroll reveal (staggered; instant when reduced motion is preferred)
  const revealEls = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach((el, i) => { el.style.transitionDelay = Math.min((i % 4) * 90, 270) + 'ms'; io.observe(el); });
  }

  // Footer year
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  // Back-to-top button (appears after scrolling; keyboard reachable)
  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'back-to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.textContent = '↑';
  document.body.appendChild(toTop);
  window.addEventListener('scroll', () => {
    toTop.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: scrollBehavior }));

  // Gallery lightbox (gallery.html only)
  const lightboxEl = document.getElementById('lightbox');
  if (lightboxEl && window.bootstrap) {
    const lightbox = new bootstrap.Modal(lightboxEl);
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    document.querySelectorAll('[data-lightbox]').forEach(btn => {
      btn.addEventListener('click', () => {
        lightboxImg.src = btn.dataset.full;
        lightboxImg.alt = btn.dataset.caption || '';
        lightboxCaption.textContent = btn.dataset.caption || 'Gallery image';
        lightbox.show();
      });
    });
  }

  // Booking form (booking.html only)
  const form = document.getElementById('booking-form');
  if (form) {
    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

    // Preselect the service when arriving from a Services "Book" link (?service=…)
    const wanted = new URLSearchParams(location.search).get('service');
    const serviceSelect = document.getElementById('service');
    if (wanted && serviceSelect) {
      [...serviceSelect.options].forEach(o => { if (o.text === wanted) serviceSelect.value = o.value || o.text; });
    }

    // Inline validation: mark invalid fields, show their message, focus the first one.
    function validate() {
      let firstInvalid = null;
      form.querySelectorAll('[required]').forEach(field => {
        const ok = field.checkValidity();
        field.classList.toggle('is-invalid', !ok);
        field.setAttribute('aria-invalid', ok ? 'false' : 'true');
        const msg = document.getElementById(field.id + 'Error');
        if (msg) msg.classList.toggle('show', !ok);
        if (!ok && !firstInvalid) firstInvalid = field;
      });
      return firstInvalid;
    }
    form.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('input', () => {
        if (field.checkValidity()) {
          field.classList.remove('is-invalid');
          field.removeAttribute('aria-invalid');
          const msg = document.getElementById(field.id + 'Error');
          if (msg) msg.classList.remove('show');
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('booking-status');
      const invalid = validate();
      if (invalid) {
        status.className = 'alert alert-danger';
        status.textContent = 'Please complete the highlighted fields and try again.';
        invalid.focus();
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const res = await fetch('booking.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('backend unavailable');
        const out = await res.json();
        if (!out.ok) throw new Error(out.error || 'validation failed');
        status.className = 'alert alert-success';
        status.innerHTML = `<strong>Booking confirmed!</strong> ${out.message || ''} Reference: <strong>${out.reference || ''}</strong>`;
        form.reset();
      } catch (err) {
        // No PHP backend (static hosting / file://) — clearly-labelled demo state, never a fake submission.
        status.className = 'alert alert-info';
        status.innerHTML = `<strong>Demo mode — no backend connected.</strong> Your booking was <em>not</em> actually sent. ` +
          `On a PHP host this form posts to <code>booking.php</code> and returns a real confirmation. ` +
          `Demo summary: ${data.service} on ${data.date} at ${data.time} for ${data.name}.`;
      } finally {
        btn.disabled = false; btn.textContent = 'Confirm booking';
        status.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
      }
    });
  }
});
