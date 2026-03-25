

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase, ref, push, onValue, remove
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


const ADMIN_SECRET_KEY = "mirumer00";

const app       = initializeApp(firebaseConfig);
const auth      = getAuth(app);
const db        = getDatabase(app);
const gProvider = new GoogleAuthProvider();


document.addEventListener('DOMContentLoaded', () => {
  const authCard = document.querySelector('.auth-card');
  if (!authCard) return;

 
  const tabBar = document.createElement('div');
  tabBar.className = 'auth-tabs';
  tabBar.innerHTML = `
    <button class="auth-tab-btn active" data-tab="login"  onclick="switchAuthTab('login')">Login</button>
    <button class="auth-tab-btn"        data-tab="signup" onclick="switchAuthTab('signup')">Sign Up</button>
  `;
  authCard.insertBefore(tabBar, document.getElementById('auth-error'));

  
  document.getElementById('login-form').insertAdjacentHTML('beforeend', `
    <div class="auth-divider"><span>or</span></div>
    <button class="btn-google" onclick="doGoogleSignIn()">${googleSVG()} Continue with Google</button>
  `);

  
  const signupPanel = document.createElement('div');
  signupPanel.id = 'signup-form';
  signupPanel.style.display = 'none';
  signupPanel.innerHTML = `
    <div class="field">
      <label>Email *</label>
      <input type="email" id="su-email" placeholder="admin@example.com" autocomplete="email">
    </div>
    <div class="field">
      <label>Password *</label>
      <input type="password" id="su-pass" placeholder="Min 6 characters" autocomplete="new-password">
    </div>
    <div class="field">
      <label>Admin Secret Key *</label>
      <input type="password" id="su-secret" placeholder="Enter the secret key">
    </div>
    <button class="btn-main" id="su-btn" onclick="doSignUp()">Create Account</button>
    <div class="auth-divider"><span>or</span></div>
    <button class="btn-google" onclick="doGoogleSignIn()">${googleSVG()} Continue with Google</button>
  `;
  authCard.appendChild(signupPanel);

  
  document.head.insertAdjacentHTML('beforeend', `<style>
    .auth-tabs{display:flex;gap:4px;margin-bottom:20px;background:rgba(0,0,0,.06);border-radius:10px;padding:4px}
    .auth-tab-btn{flex:1;padding:8px 0;border:none;border-radius:7px;background:transparent;font-family:inherit;font-size:14px;font-weight:500;color:#888;cursor:pointer;transition:all .2s}
    .auth-tab-btn.active{background:#fff;color:#1a1a1a;box-shadow:0 1px 4px rgba(0,0,0,.12)}
    .auth-divider{display:flex;align-items:center;gap:10px;margin:14px 0;color:#aaa;font-size:12px}
    .auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:#e5e7eb}
    .btn-google{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:11px 0;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-family:inherit;font-size:14px;font-weight:500;color:#3c4043;cursor:pointer;transition:all .2s}
    .btn-google:hover{background:#f8f9fa;border-color:#dadce0;box-shadow:0 1px 6px rgba(0,0,0,.1)}
    .btn-google:active{transform:scale(.98)}
  </style>`);
});

function googleSVG() {
  return `<svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.9 6.1C12.5 13.2 17.8 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 6.9-10.1 6.9-17z"/>
    <path fill="#FBBC05" d="M10.6 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8.1-6.2z"/>
    <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.8l-8.1 6.2C6.7 42.6 14.7 48 24 48z"/>
  </svg>`;
}

window.switchAuthTab = (tab) => {
  clearAuthErr();
  document.querySelectorAll('.auth-tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  document.getElementById('login-form').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('signup-form').style.display = tab === 'signup' ? 'block' : 'none';
};


onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById('user-email').textContent = user.displayName || user.email;
    showPage('dashboard-page');
    loadProducts();
  } else {
    showPage('auth-page');
  }
});


window.doLogin = async () => {
  const email = v('li-email');
  const pass  = v('li-pass');

  if (!email || !pass) return authErr('Please fill in all fields.');
  if (!isEmail(email))  return authErr('Enter a valid email address.');

  clearAuthErr();
  setBtnLoading('li-btn', true, 'Signing in…');
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    /* onAuthStateChanged handles the redirect */
  } catch (e) {
    authErr(friendlyError(e.code));
    setBtnLoading('li-btn', false, 'Login to Dashboard');
  }
};


 
window.doSignUp = async () => {
  const email     = v('su-email');
  const pass      = v('su-pass');
  const secretKey = v('su-secret');

  if (!email || !pass || !secretKey)
    return authErr('Please fill in all fields.');
  if (!isEmail(email))
    return authErr('Enter a valid email address.');
  if (pass.length < 6)
    return authErr('Password must be at least 6 characters.');
  if (secretKey !== ADMIN_SECRET_KEY)
    return authErr('Invalid secret key.');

  clearAuthErr();
  setBtnLoading('su-btn', true, 'Creating account…');
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    toast('Account created! Welcome.', 'success');
    /* onAuthStateChanged fires → dashboard loads automatically */
  } catch (e) {
    authErr(friendlyError(e.code));
    setBtnLoading('su-btn', false, 'Create Account');
  }
};

/* ── GOOGLE SIGN IN ────────────────────────────────────── */
window.doGoogleSignIn = async () => {
  clearAuthErr();
  try {
    await signInWithPopup(auth, gProvider);
    toast('Signed in with Google!', 'success');
    /* onAuthStateChanged handles the redirect */
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user')
      authErr(friendlyError(e.code));
  }
};

/* ── LOGOUT ────────────────────────────────────────────── */
window.doLogout = async () => {
  await signOut(auth);
  toast('Logged out. See you soon!');
};

/* ── ADD PRODUCT ───────────────────────────────────────── */
window.addProduct = async () => {
  const name  = v('p-name'),
        price = v('p-price'),
        cat   = v('p-cat'),
        cond  = v('p-cond'),
        desc  = v('p-desc');

  if (!name || !price || !cat || !cond)
    return toast('Please fill all required fields (*).', 'error');

  const btn = document.getElementById('add-btn');
  btn.innerHTML = '<span class="spin"></span> Adding…';
  btn.disabled = true;

  try {
    let imageData = '';
    const imgFile = document.getElementById('p-img').files[0];
    if (imgFile) {
      if (imgFile.size > 2 * 1024 * 1024) {
        toast('Image must be under 2 MB.', 'error');
        return;
      }
      imageData = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(imgFile);
      });
    }

    await push(ref(db, 'products'), {
      name, price: parseFloat(price), category: cat,
      condition: cond, desc,
      image: imageData,
      createdAt: Date.now(),
      addedBy: auth.currentUser.email
    });

    ['p-name','p-price','p-cat','p-cond','p-desc']
      .forEach(id => document.getElementById(id).value = '');
    removeImg();
    toast('Item added successfully.', 'success');
  } catch (e) {
    toast('Error adding item. Check database rules.', 'error');
  } finally {
    btn.innerHTML = `<svg width="18" height="18"><use href="#ic-plus"/></svg> Add to Bazar`;
    btn.disabled = false;
  }
};

window.previewImg = (input) => {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('img-preview-el').src = e.target.result;
    document.getElementById('img-preview-el').classList.add('show');
    document.getElementById('img-placeholder').style.display = 'none';
    document.getElementById('img-remove-btn').classList.add('show');
  };
  reader.readAsDataURL(file);
};

window.removeImg = () => {
  document.getElementById('p-img').value = '';
  document.getElementById('img-preview-el').src = '';
  document.getElementById('img-preview-el').classList.remove('show');
  document.getElementById('img-placeholder').style.display = 'flex';
  document.getElementById('img-remove-btn').classList.remove('show');
};

/* ── LOAD & RENDER PRODUCTS ────────────────────────────── */
function loadProducts() {
  onValue(ref(db, 'products'), snapshot => {
    const grid = document.getElementById('products-grid');
    const data = snapshot.val();

    if (!data) {
      grid.innerHTML = `
        <div class="empty">
          <div class="e-icon"><svg><use href="#ic-tag"/></svg></div>
          <h3>No items yet</h3>
          <p>Add your first thrift piece using the form above!</p>
        </div>`;
      updateStats([]);
      return;
    }

    const items = Object.entries(data).reverse();
    updateStats(items.map(([, p]) => p));

    const badge = document.getElementById('p-badge');
    badge.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
    badge.style.display = 'inline-block';

    grid.innerHTML = items.map(([id, p]) => `
      <div class="product-card">
        ${p.image
          ? `<img class="p-img" src="${p.image}" alt="${esc(p.name)}">`
          : `<div class="p-img-placeholder"><svg><use href="#ic-camera"/></svg></div>`
        }
        <div class="p-cat-row">
          <div class="p-cat-icon"><svg><use href="${catIcon(p.category)}"/></svg></div>
          <span class="p-cat">${p.category}</span>
        </div>
        <div class="p-name">${esc(p.name)}</div>
        <div class="p-desc">${esc(p.desc || 'No description provided.')}</div>
        <div class="p-footer">
          <div>
            <div class="p-price">PKR ${Number(p.price).toLocaleString()}</div>
            <div class="p-cond">
              <svg><use href="#ic-condition"/></svg>
              ${p.condition}
            </div>
          </div>
          <button class="btn-del" onclick="delProduct('${id}')" title="Remove listing">
            <svg><use href="#ic-trash"/></svg>
          </button>
        </div>
      </div>`).join('');
  });
}

/* ── DELETE PRODUCT ────────────────────────────────────── */
window.delProduct = async id => {
  if (!confirm('Remove this item from the bazar?')) return;
  try {
    await remove(ref(db, `products/${id}`));
    toast('Item removed.', 'success');
  } catch (e) { toast('Could not delete. Try again.', 'error'); }
};

/* ── STATS ─────────────────────────────────────────────── */
function updateStats(products) {
  const total    = products.length;
  const shirts   = products.filter(p =>
    ['Shirts','T-Shirts','Oversized Shirts'].includes(p.category)).length;
  const newItems = products.filter(p => p.condition === 'Like New').length;
  const avg      = total
    ? Math.round(products.reduce((s, p) => s + p.price, 0) / total).toLocaleString()
    : '–';
  document.getElementById('stat-total').textContent  = total;
  document.getElementById('stat-shirts').textContent = shirts;
  document.getElementById('stat-new').textContent    = newItems;
  document.getElementById('stat-avg').textContent    = avg;
}

/* ── CATEGORY ICON MAP ─────────────────────────────────── */
function catIcon(cat) {
  const map = {
    'Shirts':'#ic-shirt','T-Shirts':'#ic-shirt',
    'Jackets':'#ic-jacket','Pants':'#ic-pants',
    'Dress Pants':'#ic-pants','Jeans':'#ic-pants',
    'Baggy Pants':'#ic-pants','Oversized Shirts':'#ic-shirt',
    'Shorts':'#ic-pants',
  };
  return map[cat] || '#ic-tag';
}

/* ── PAGE SWITCHER ─────────────────────────────────────── */
window.showPage = id => {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
};

/* ── HELPERS ───────────────────────────────────────────── */
const v       = id => document.getElementById(id)?.value.trim() ?? '';
const esc     = s  => s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
const isEmail = s  => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function clearAuthErr() {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = '';
  el.className = 'error-box';
}

function authErr(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = msg;
  el.className = 'error-box show';
}

function setBtnLoading(id, loading, label) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading ? `<span class="spin"></span> ${label}` : label;
}

function toast(msg, type = '') {
  const el = document.getElementById('toast');
  if (!el) return;
  const iconMap = { success: '#ic-check', error: '#ic-x', '': '#ic-info' };
  el.innerHTML = `
    <svg class="toast-icon" style="color:${type==='success'?'#38A169':type==='error'?'#E53E3E':'#aaa'}">
      <use href="${iconMap[type]||'#ic-info'}"/>
    </svg>${msg}`;
  el.className = `toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 3500);
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password.',
    'auth/invalid-credential':     'Invalid email or password.',
    'auth/email-already-in-use':   'This email is already registered.',
    'auth/invalid-email':          'Invalid email address.',
    'auth/weak-password':          'Password is too weak (min 6 chars).',
    'auth/too-many-requests':      'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-blocked':          'Popup blocked. Allow popups and retry.',
    'auth/unauthorized-domain':    'Domain not authorized. Add it in Firebase Console → Authentication → Authorized Domains.',
  };
  return map[code] || `Auth error: ${code}`;
}