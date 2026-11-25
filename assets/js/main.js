// Luxe Nails Studio — shared interactions
document.addEventListener('DOMContentLoaded', () => {
  // Scroll reveal
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Footer year
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  // Booking form (booking.html only)
  const form = document.getElementById('booking-form');
  if (form) {
    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('booking-status');
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
        status.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
});
