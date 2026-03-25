

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase, ref, onValue, push
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";


const firebaseConfig = {
  apiKey:            "AIzaSyARYoO9GHRvL7n9Au3RuE3TyRSFwwrJSzc",
  authDomain:        "hxvjg-5f74a.firebaseapp.com",
  projectId:         "hxvjg-5f74a",
  storageBucket:     "hxvjg-5f74a.firebasestorage.app",
  messagingSenderId: "11760257468",
  appId:             "1:11760257468:web:78f56b2c4bbf62b7e1c3b9",
  databaseURL:       "https://hxvjg-5f74a-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);


let allProducts = [];
let activeCat   = 'all';
let searchQuery = '';


onValue(ref(db, 'products'), snapshot => {
  const data = snapshot.val();
  document.getElementById('loadingState').style.display = 'none';

  if (!data) {
    allProducts = [];
    renderProducts([]);
    document.getElementById('hero-count').textContent = '0';
    return;
  }

  allProducts = Object.entries(data).map(([id, p]) => ({ id, ...p }))
                      .reverse(); // newest first

  document.getElementById('hero-count').textContent = allProducts.length;
  renderProducts(filterProducts());
});

/* ── Filter logic ────────────────────────────────────── */
function filterProducts() {
  return allProducts.filter(p => {
    const catOk   = activeCat === 'all' || p.category === activeCat;
    const searchOk = !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery) ||
      p.desc?.toLowerCase().includes(searchQuery) ||
      p.category?.toLowerCase().includes(searchQuery);
    return catOk && searchOk;
  });
}

/* ── Render products grid ────────────────────────────── */
function renderProducts(items) {
  const grid  = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyState');

  if (!items.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = items.map((p, i) => `
    <div class="product-card" onclick="openModal('${p.id}')"
         style="animation-delay:${i * 0.06}s">
      <div class="p-img-wrap">
        ${p.image
          ? `<img src="${p.image}" alt="${esc(p.name)}" loading="lazy">`
          : `<div class="p-no-img"><svg width="44" height="44"><use href="#ic-shopping-bag"/></svg><span>No Photo</span></div>`
        }
        <div class="p-cond-badge ${condClass(p.condition)}">${p.condition || 'Good'}</div>
        <div class="p-cat-badge">
          <svg width="16" height="16"><use href="${catIcon(p.category)}"/></svg>
        </div>
      </div>
      <div class="p-body">
        <div class="p-cat-label">${p.category || 'Other'}</div>
        <div class="p-name">${esc(p.name)}</div>
        <div class="p-desc">${esc(p.desc || 'No description provided.')}</div>
        <div class="p-footer">
          <div class="p-price">PKR ${Number(p.price).toLocaleString()} <span>/ piece</span></div>
          <button class="btn-order" onclick="event.stopPropagation(); orderViaWA('${esc(p.name)}', '${p.price}')">
            <svg width="14" height="14"><use href="#ic-shopping-bag"/></svg>
            Order
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ── Category filter (global so onclick works) ──────── */
window.filterCat = (cat, btn) => {
  activeCat = cat;
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(filterProducts());
};

/* ── Search filter ───────────────────────────────────── */
window.searchProducts = () => {
  searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
  renderProducts(filterProducts());
};

/* ══════════════════════════════════════════════════════
   PRODUCT MODAL
══════════════════════════════════════════════════════ */
window.openModal = (id) => {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;

  document.getElementById('modalContent').innerHTML = `
    ${p.image
      ? `<img src="${p.image}" alt="${esc(p.name)}" class="modal-img">`
      : `<div class="modal-no-img"><svg width="56" height="56"><use href="#ic-shopping-bag"/></svg></div>`
    }
    <div class="modal-body">
      <div class="modal-cat">
        <svg width="14" height="14"><use href="${catIcon(p.category)}"/></svg>
        ${p.category || 'Other'}
      </div>
      <div class="modal-name">${esc(p.name)}</div>
      <div class="modal-desc">${esc(p.desc || 'No description provided.')}</div>
      <div class="modal-meta">
        <div class="modal-meta-item">
          <span class="label">Price</span>
          <span class="val">PKR ${Number(p.price).toLocaleString()}</span>
        </div>
        <div class="modal-meta-item">
          <span class="label">Condition</span>
          <span class="val cond-val"><span class="p-cond-badge ${condClass(p.condition)}" style="position:static">${p.condition || 'Good'}</span></span>
        </div>
        <div class="modal-meta-item">
          <span class="label">Category</span>
          <span class="val" style="font-size:15px;font-family:'DM Sans'">${p.category || 'Other'}</span>
        </div>
      </div>
      <div class="modal-actions">
        <a href="${waOrderLink(p.name, p.price)}" target="_blank" class="btn-wa-order">
          <svg width="18" height="18"><use href="#ic-whatsapp"/></svg>
          Order on WhatsApp
        </a>
        <a href="#contact" class="btn-primary" onclick="closeModal(); prefillForm('${esc(p.name)}', '${p.price}')">
          <svg width="16" height="16"><use href="#ic-shopping-bag"/></svg>
          Fill Order Form
        </a>
      </div>
    </div>
  `;

  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeModal = () => {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
};

window.prefillForm = (name, price) => {
  const el = document.getElementById('o-item');
  if (el) el.value = `${name} (PKR ${Number(price).toLocaleString()})`;
};

/* ══════════════════════════════════════════════════════
   QUICK ORDER VIA WHATSAPP
══════════════════════════════════════════════════════ */
window.orderViaWA = (name, price) => {
  window.open(waOrderLink(name, price), '_blank');
};

function waOrderLink(name, price) {
  const msg = encodeURIComponent(
    `Hi Thrift Bazar! 👋\n\nI'd like to order:\n📦 *${name}*\n💰 PKR ${Number(price).toLocaleString()}\n\nPlease confirm availability and share payment details.`
  );
  return `https://wa.me/923408440671?text=${msg}`;
}

/* ══════════════════════════════════════════════════════
   QUICK ORDER FORM — saves to Firebase + sends WhatsApp
══════════════════════════════════════════════════════ */
document.getElementById('quickOrderForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = document.getElementById('o-name').value.trim();
  const phone   = document.getElementById('o-phone').value.trim();
  const address = document.getElementById('o-address').value.trim();
  const item    = document.getElementById('o-item').value.trim();
  const notes   = document.getElementById('o-notes').value.trim();

  if (!name || !phone || !address) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  const btn = document.getElementById('orderBtn');
  btn.innerHTML = '<span class="spin" style="width:18px;height:18px;border-width:2px;display:inline-block"></span> Sending…';
  btn.disabled = true;

  /* ── Save order to Firebase (admins will see it) ── */
  try {
    await push(ref(db, 'orders'), {
      customerName:    name,
      customerPhone:   phone,
      deliveryAddress: address,
      itemOrdered:     item || 'Not specified',
      notes:           notes || '',
      status:          'pending',
      orderedAt:       Date.now(),
      orderedAtFormatted: new Date().toLocaleString('en-PK', {
        dateStyle: 'medium', timeStyle: 'short'
      })
    });
  } catch (err) {
    console.warn('Order save failed:', err.message);
    /* Don't block WhatsApp redirect if DB fails */
  }

  /* ── Also open WhatsApp so admin gets instant notification ── */
  const waMsg = encodeURIComponent(
    `🛍️ *NEW ORDER — Thrift Bazar*\n\n` +
    `👤 *Customer:* ${name}\n` +
    `📞 *Phone:* ${phone}\n` +
    `📍 *Address:* ${address}\n` +
    `📦 *Item:* ${item || 'Not specified'}\n` +
    `📝 *Notes:* ${notes || 'None'}\n\n` +
    `_Order placed via website_`
  );
  window.open(`https://wa.me/923408440671?text=${waMsg}`, '_blank');

  /* ── Show success ── */
  document.getElementById('quickOrderForm').style.display = 'none';
  document.getElementById('formSuccess').style.display = 'block';
  showToast('Order sent! We\'ll contact you soon.', 'success');
});

/* ══════════════════════════════════════════════════════
   NAVBAR SCROLL EFFECT + ACTIVE LINKS
══════════════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  // Active nav link highlight
  const sections = ['hero','products','why-us','contact'];
  let current = 'hero';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) current = id;
  });
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
});

/* ── Mobile menu ─────────────────────────────────────── */
window.toggleMenu = () => {
  const m = document.getElementById('mobileMenu');
  m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
};
window.closeMenu = () => {
  document.getElementById('mobileMenu').style.display = 'none';
};

/* ── ESC to close modal ──────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') window.closeModal();
});

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function condClass(cond) {
  const map = {
    'Like New':     'cond-like-new',
    'Good':         'cond-good',
    'Fair':         'cond-fair',
    'Needs Repair': 'cond-repair'
  };
  return map[cond] || 'cond-good';
}

function catIcon(cat) {
  const map = {
    'Shirts':          '#ic-shirt',
    'T-Shirts':        '#ic-shirt',
    'Oversized Shirts':'#ic-shirt',
    'Jackets':         '#ic-jacket',
    'Pants':           '#ic-pants',
    'Dress Pants':     '#ic-pants',
    'Jeans':           '#ic-pants',
    'Baggy Pants':     '#ic-pants',
    'Shorts':          '#ic-pants',
  };
  return map[cat] || '#ic-tag';
}

function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 3500);
}
