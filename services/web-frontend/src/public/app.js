/* Simple storefront talking to the API gateway. No build step. */
const GATEWAY = (window.__GATEWAY_URL__ || 'http://localhost:3000').replace(/\/$/, '');
const state = { page: 1, limit: 12, totalPages: 1 };

const $ = (id) => document.getElementById(id);
const token = () => localStorage.getItem('wf_token') || '';
const cart = () => JSON.parse(localStorage.getItem('wf_cart') || '[]');
const saveCart = (c) => {
  localStorage.setItem('wf_cart', JSON.stringify(c));
  $('cart-count').textContent = c.reduce((n, i) => n + i.quantity, 0);
};

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const res = await fetch(`${GATEWAY}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Tabs
document.querySelectorAll('nav button[data-tab]').forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll('nav button[data-tab]').forEach((x) => x.classList.remove('active'));
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    $(`tab-${b.dataset.tab}`).classList.add('active');
    if (b.dataset.tab === 'orders') loadOrders();
    if (b.dataset.tab === 'account') loadProfile();
    if (b.dataset.tab === 'cart') renderCart();
  };
});

// Gateway status dot
fetch(`${GATEWAY}/health`).then((r) => r.json()).then((h) => {
  $('status-dot').className = h.status === 'healthy' ? 'ok' : 'bad';
  $('status-dot').title = `gateway: ${h.status}`;
}).catch(() => { $('status-dot').className = 'bad'; });

// Products
async function loadProducts() {
  const q = new URLSearchParams({
    page: state.page, limit: state.limit,
    ...( $('search').value && { search: $('search').value } ),
    ...( $('category').value && { category: $('category').value } ),
  });
  const res = await api(`/api/products?${q}`);
  const { products, pagination } = res.data;
  state.totalPages = pagination.totalPages || 1;
  $('page-info').textContent = `Page ${pagination.page} of ${state.totalPages} (${pagination.total} items)`;
  const cats = new Set([...$('category').options].map((o) => o.value));
  products.forEach((p) => { if (p.category && !cats.has(p.category)) $('category').append(new Option(p.category, p.category)); });
  $('products').innerHTML = products.map((p) => `
    <div class="card">
      <h3>${escapeHtml(p.name)}</h3>
      <div>${escapeHtml(p.category || '')}</div>
      <div class="price">$${p.price}</div>
      <div>Stock: ${p.stock}</div>
      <button onclick="viewProduct('${p.id}')">View</button>
      <button onclick="addToCart('${p.id}')">Add to cart</button>
    </div>`).join('') || '<p>No products found.</p>';
}

async function viewProduct(id) {
  const res = await api(`/api/products/${id}`);
  const p = res.data;
  $('modal-content').innerHTML = `<h2>${escapeHtml(p.name)}</h2>
    <p>${escapeHtml(p.description || '')}</p>
    <p class="price">$${p.price} — Stock: ${p.stock}</p>
    <p>Category: ${escapeHtml(p.category || '-')}</p>
    <button onclick="addToCart('${p.id}')">Add to cart</button>`;
  $('product-modal').classList.remove('hidden');
}
$('modal-close').onclick = () => $('product-modal').classList.add('hidden');

function addToCart(productId) {
  const c = cart();
  const line = c.find((i) => i.productId === productId);
  if (line) line.quantity += 1; else c.push({ productId, quantity: 1 });
  saveCart(c);
  renderCart();
}
window.addToCart = addToCart;
window.viewProduct = viewProduct;

function renderCart() {
  const c = cart();
  $('cart-items').innerHTML = c.map((i, idx) => `
    <div class="cart-row"><span>${escapeHtml(i.productId)} × ${i.quantity}</span>
    <span><button onclick="changeQty(${idx},1)">+</button>
    <button onclick="changeQty(${idx},-1)">−</button></span></div>`).join('') || '<p>Cart is empty.</p>';
}
window.changeQty = (idx, d) => {
  const c = cart(); c[idx].quantity += d;
  if (c[idx].quantity <= 0) c.splice(idx, 1);
  saveCart(c); renderCart();
};

$('checkout-form').onsubmit = async (e) => {
  e.preventDefault();
  if (!token()) { $('checkout-msg').textContent = 'Please login first (Account tab).'; return; }
  const c = cart();
  if (!c.length) { $('checkout-msg').textContent = 'Cart is empty.'; return; }
  const fd = new FormData(e.target);
  try {
    const res = await api('/api/orders', { method: 'POST', body: JSON.stringify({
      items: c, shippingAddress: Object.fromEntries(fd),
    })});
    saveCart([]); renderCart();
    $('checkout-msg').textContent = `Order placed! ID: ${res.data.id || res.data.order?.id || JSON.stringify(res.data)}`;
  } catch (err) { $('checkout-msg').textContent = err.message; }
};

// Orders
async function loadOrders() {
  if (!token()) { $('orders').innerHTML = '<p>Please login first.</p>'; return; }
  try {
    const res = await api('/api/orders');
    const orders = res.data.orders || res.data;
    $('orders').innerHTML = orders.map((o) => `
      <div class="order"><b>${o.id}</b> — ${o.status} — $${o.totalAmount}
      <div>${(o.items || []).map((i) => `${escapeHtml(i.productId)} × ${i.quantity}`).join(', ')}</div></div>`).join('')
      || '<p>No orders yet.</p>';
  } catch (err) { $('orders').innerHTML = `<p>${escapeHtml(err.message)}</p>`; }
}
$('load-orders').onclick = loadOrders;

// Auth + profile
$('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(e.target));
  try {
    const res = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(fd) });
    localStorage.setItem('wf_token', res.data.token);
    $('auth-msg').textContent = 'Logged in!';
    loadProfile();
  } catch (err) { $('auth-msg').textContent = err.message; }
};
$('register-form').onsubmit = async (e) => {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(e.target));
  try {
    const res = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(fd) });
    localStorage.setItem('wf_token', res.data.token);
    $('auth-msg').textContent = 'Registered + logged in!';
    loadProfile();
  } catch (err) { $('auth-msg').textContent = err.message; }
};
$('logout').onclick = () => { localStorage.removeItem('wf_token'); loadProfile(); };

async function loadProfile() {
  if (!token()) { $('profile').innerHTML = '<p>Not logged in.</p>'; return; }
  try {
    const res = await api('/api/users/profile');
    $('profile').innerHTML = `<p><b>${escapeHtml(res.data.name)}</b> (${escapeHtml(res.data.email)}) — ${escapeHtml(res.data.role)}</p>`;
  } catch (err) { $('profile').innerHTML = `<p>${escapeHtml(err.message)}</p>`; }
}

function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

$('reload').onclick = loadProducts;
$('search').onchange = () => { state.page = 1; loadProducts(); };
$('category').onchange = () => { state.page = 1; loadProducts(); };
$('prev').onclick = () => { if (state.page > 1) { state.page -= 1; loadProducts(); } };
$('next').onclick = () => { if (state.page < state.totalPages) { state.page += 1; loadProducts(); } };

saveCart(cart());
loadProducts();
loadProfile();
