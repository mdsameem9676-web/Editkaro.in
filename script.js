const projects = [
  { id:1, title:"Cinematic Reel Montage",    cat:"short-form",    gradient:"tg-1", icon:"⚡", yt:"",  vimeo:"1193328787" },
  { id:2, title:"Gaming Highlight Pack",      cat:"gaming",        gradient:"tg-3", icon:"🎮", yt:"",  vimeo:"8668510" },
  { id:3, title:"Anime AMV — Flicker",        cat:"anime",         gradient:"tg-7", icon:"", yt:"",  vimeo:"454629440" },
  { id:4, title:"Brand Documentary Cut",      cat:"documentary",   gradient:"tg-6", icon:"🎬", yt:"",  vimeo:"114572713" },
  { id:5, title:"Short-Form Product Ad",      cat:"ecommerce",     gradient:"tg-5", icon:"🛒", yt:"",  vimeo:"576913352" },
  { id:6, title:"Teal & Orange Grade",        cat:"color-grading", gradient:"tg-8", icon:"🎨", yt:"",  vimeo:"1201448990" },
  { id:7, title:"El Clásico Fan Edit",        cat:"football",      gradient:"tg-4", icon:"⚽", yt:"",  vimeo:"1201909376" },
  { id:8, title:"YouTube Travel Series EP1",  cat:"long-form",     gradient:"tg-2", icon:"🌍", yt:"",  vimeo:"1189000280" },
  { id:9, title:"FPS Esports Montage",        cat:"gaming",        gradient:"tg-9", icon:"🎯", yt:"",  vimeo:"1198597190" },
];

const marqueeItems = [
  "Short-Form Editing","Color Grading","Gaming Content","Anime Edits",
  "Documentary Films","eCommerce Ads","Football Edits","Long-Form Videos","Motion Graphics"
];

// Cache for Vimeo thumbnails: { vimeoId: thumbnailUrl }
const thumbCache = {};

async function fetchVimeoThumb(vimeoId) {
  if (thumbCache[vimeoId]) return thumbCache[vimeoId];
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}&width=640`);
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    thumbCache[vimeoId] = data.thumbnail_url || null;
    return thumbCache[vimeoId];
  } catch {
    return null;
  }
}

const intro = document.getElementById('cinematic-intro');
document.body.style.overflow = 'hidden';
setTimeout(() => {
  intro.classList.add('done');
  document.body.style.overflow = '';
}, 5200);

function buildSprockets() {
  ['sprockets-left','sprockets-right'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    for (let i = 0; i < 20; i++) {
      const h = document.createElement('div');
      h.className = 'sprocket-hole';
      el.appendChild(h);
    }
  });
}
buildSprockets();

const track = document.getElementById('marqueeTrack');
const items = [...marqueeItems, ...marqueeItems];
items.forEach(t => {
  const div = document.createElement('div');
  div.className = 'marquee-item';
  div.innerHTML = `${t} <span class="dot">✦</span>`;
  track.appendChild(div);
});

async function renderCards(filter) {
  const grid = document.getElementById('portfolioGrid');
  grid.innerHTML = '';
  const filtered = filter === 'all' ? projects : projects.filter(p => p.cat === filter);

  // Create all cards immediately with gradient fallback, then hydrate thumbnails
  filtered.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'pcard';
    card.setAttribute('data-cat', p.cat);
    card.style.cssText = filter !== 'all' ? 'grid-column: span 4;' : '';
    card.innerHTML = `
      <div class="thumb-wrap" style="position:relative; overflow:hidden; width:100%; height:100%; min-height:220px; border-radius:inherit;">
        <div class="thumb-gradient ${p.gradient} thumb-bg" style="position:absolute; inset:0; width:100%; height:100%;"></div>
        <img class="thumb-img" src="" alt="${p.title}" style="
          position:absolute; inset:0; width:100%; height:100%;
          object-fit:cover; opacity:0;
          transition: opacity 0.5s ease;
        "/>
        <div class="thumb-icon" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:2; font-size:2.5rem; pointer-events:none;">${p.icon}</div>
      </div>
      <div class="pcard-overlay">
        <div class="pcard-cat">${p.cat.replace('-',' ')}</div>
        <div class="pcard-title">${p.title}</div>
      </div>
      <div class="pcard-play">
        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </div>
    `;

    // Ensure card has defined height so thumb-wrap fills it
    card.style.minHeight = '220px';
    card.style.position = 'relative';
    card.style.overflow = 'hidden';

    card.addEventListener('click', () => openLightbox(p));
    grid.appendChild(card);

    // Async: fetch thumbnail and swap in
    if (p.vimeo) {
      fetchVimeoThumb(p.vimeo).then(url => {
        if (!url) return;
        const img = card.querySelector('.thumb-img');
        if (!img) return;
        img.src = url;
        img.onload = () => {
          img.style.opacity = '1';
          // Fade out the gradient bg once image loads
          const bg = card.querySelector('.thumb-bg');
          if (bg) bg.style.opacity = '0';
        };
      });
    }
  });
}
renderCards('all');

document.getElementById('filterBar').addEventListener('click', e => {
  if (!e.target.classList.contains('filter-btn')) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  renderCards(e.target.dataset.filter);
});

function openLightbox(p) {
  document.getElementById('lightboxCat').textContent = p.cat.replace('-',' ').toUpperCase();
  document.getElementById('lightboxTitle').textContent = p.title;
  const frame = document.getElementById('lightboxFrame');
  const placeholder = document.getElementById('lightboxPlaceholder');
  const placeholderTitle = document.getElementById('lightboxPlaceholderTitle');
  let src = '';
  if (p.yt) {
    src = 'https://www.youtube.com/embed/' + p.yt + '?autoplay=1';
  } else if (p.vimeo) {
    src = 'https://player.vimeo.com/video/' + p.vimeo + '?autoplay=1';
  }
  if (src) {
    frame.src = src;
    frame.classList.remove('hidden');
    placeholder.classList.remove('visible');
  } else {
    frame.src = 'about:blank';
    frame.classList.add('hidden');
    placeholderTitle.textContent = p.title;
    placeholder.classList.add('visible');
  }
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
});

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  const frame = document.getElementById('lightboxFrame');
  frame.src = 'about:blank';
  frame.classList.remove('hidden');
  document.getElementById('lightboxPlaceholder').classList.remove('visible');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

const nav = document.getElementById('mainNav');
const heroSection = document.getElementById('hero');
function updateNav() {
  const heroBottom = heroSection.getBoundingClientRect().bottom;
  if (heroBottom <= 80) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', updateNav);
updateNav();

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});
document.querySelectorAll('.mm-link').forEach(l => {
  l.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));

let billing = 'monthly';
function toggleBilling(mode) {
  billing = mode || (billing === 'monthly' ? 'annual' : 'monthly');
  const sw = document.querySelector('.pt-switch');
  const monthly = document.getElementById('ptMonthly');
  const annual  = document.getElementById('ptAnnual');
  if (billing === 'annual') {
    sw.classList.add('on');
    monthly.classList.remove('active');
    annual.classList.add('active');
  } else {
    sw.classList.remove('on');
    monthly.classList.add('active');
    annual.classList.remove('active');
  }
  document.querySelectorAll('.pp-amount').forEach(el => {
    const val = parseInt(el.dataset[billing].replace(',',''));
    el.textContent = val === 0 ? '0' : val.toLocaleString('en-IN');
  });
}
document.getElementById('ptMonthly').classList.add('active');

// ── Google Sheets Integration ──────────────────────────────────────────────
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyQdX9o19ixOzrClM4kb4nQPCKhQT5E_jJhN1By-I_66VqdB9Ce8dVLtPgtW3-KgOwq/exec';

// Email Collector
async function handleEmailSubmit(btn) {
  const input = document.getElementById('emailCollectorInput');
  const email = input ? input.value.trim() : '';
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }
  btn.textContent = 'Subscribing...';
  btn.disabled = true;
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'email', email })
    });
    btn.textContent = '✓ Subscribed!';
    btn.style.background = '#7B5CF5';
    btn.style.color = '#fff';
    input.value = '';
    showToast('🎉 You\'re subscribed! Welcome to Editkaro.in', 'success');
  } catch {
    btn.textContent = 'Try Again';
    btn.disabled = false;
    showToast('Something went wrong. Please try again.', 'error');
  }
}

// Contact Form
async function handleSubmit(btn) {
  const name    = document.getElementById('contactName')?.value.trim();
  const email   = document.getElementById('contactEmail')?.value.trim();
  const phone   = document.getElementById('contactPhone')?.value.trim();
  const message = document.getElementById('contactMessage')?.value.trim();

  if (!name || !email || !message) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'contact', name, email, phone, message })
    });
    btn.textContent = '✓ Message Sent!';
    btn.style.background = '#7B5CF5';
    btn.style.color = '#fff';
    showToast('🎬 Message received! We\'ll get back within 2 hours.', 'success');
    // Clear fields
    ['contactName','contactEmail','contactPhone','contactMessage'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  } catch {
    btn.textContent = 'Try Again';
    btn.disabled = false;
    showToast('Something went wrong. Please try again.', 'error');
  }
}

// Toast notification
function showToast(msg, type = 'success') {
  const existing = document.getElementById('ekToast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'ekToast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
    background: ${type === 'success' ? '#7B5CF5' : '#e74c3c'};
    color: #fff; padding: 14px 28px; border-radius: 8px;
    font-family: 'Inter', sans-serif; font-size: 0.95rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 99999; opacity: 0; transition: opacity 0.3s ease;
    max-width: 90vw; text-align: center;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
