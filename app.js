// app.js — تحسينات لسلة المشتريات والمفضلات، وتنسيق الأسعار.
// يتطلب أن يتم تحميل books.js (الذي يعرّف المتغير global `books`) قبل هذا الملف.

let cart = [];
let currentList = window.books || [];
const shippingFee = 70;
const CART_KEY = 'taleora_cart';
const FAV_KEY = 'taleora_favs';

function formatPrice(n) {
  if (typeof n !== 'number') n = Number(n) || 0;
  return n.toLocaleString('ar-EG') + ' ج.م';
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function saveCart() {
  try {
    const ids = cart.map(b => b.id);
    localStorage.setItem(CART_KEY, JSON.stringify(ids));
  } catch (e) { /* ignore */ }
}

function loadCart() {
  try {
    const ids = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    cart = ids.map(id => (books.find(b => b.id === id) || null)).filter(Boolean);
  } catch (e) {
    cart = [];
  }
}

function renderBooks(list) {
  const grid = document.getElementById("bookGrid");
  let favorites = JSON.parse(localStorage.getItem(FAV_KEY)) || [];

  if (!list || list.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px;">لا توجد نتائج مطابقة.</p>`;
    return;
  }

  grid.innerHTML = list.map(book => {
    let isFav = favorites.includes(book.id);
    const discountBadge = book.discount ? `<span class="discount-badge">خصم ${escapeHtml(book.discount)}</span>` : '';
    const oldPriceHtml = book.oldPrice ? `<span class="old-price">${formatPrice(Number(book.oldPrice))}</span>` : '';
    return `
      <div class="book-card" onclick="goToBook(${book.id})" role="button" tabindex="0" aria-label="عرض ${escapeHtml(book.title)}">
        <div class="book-cover">
          <img src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)}" loading="lazy">
          ${discountBadge}
          <button class="fav-action" onclick="toggleFavorite(event, ${book.id})" aria-label="تبديل المفضلات" style="color:${isFav ? 'var(--accent)' : '#fff'};">♥</button>
        </div>
        <div class="book-info">
          <h3>${escapeHtml(book.title)}</h3>
          <div class="book-author">${escapeHtml(book.author)}</div>
          <div class="book-desc">${escapeHtml(book.desc)}</div>
          <div class="book-footer">
            <div class="price-box">
              ${oldPriceHtml}
              <span class="price">${formatPrice(Number(book.price))}</span>
            </div>
            <button class="add-cart-btn" onclick="addToCart(event, ${book.id})" aria-label="أضف إلى السلة">أضف للسلة</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderFeaturedBooks() {
  const featuredGrid = document.getElementById("featuredGrid");
  const featured = (books || []).slice(0, 4);
  let favorites = JSON.parse(localStorage.getItem(FAV_KEY)) || [];

  featuredGrid.innerHTML = featured.map(book => {
    let isFav = favorites.includes(book.id);
    const discountBadge = book.discount ? `<span class="discount-badge">خصم ${escapeHtml(book.discount)}</span>` : '';
    const oldPriceHtml = book.oldPrice ? `<span class="old-price">${formatPrice(Number(book.oldPrice))}</span>` : '';
    return `
      <div class="book-card" onclick="goToBook(${book.id})" role="button" tabindex="0" aria-label="عرض ${escapeHtml(book.title)}">
        <div class="book-cover">
          <img src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)}" loading="lazy">
          ${discountBadge}
          <button class="fav-action" onclick="toggleFavorite(event, ${book.id})" aria-label="تبديل المفضلات" style="color:${isFav ? 'var(--accent)' : '#fff'};">♥</button>
        </div>
        <div class="book-info">
          <h3>${escapeHtml(book.title)}</h3>
          <div class="book-author">${escapeHtml(book.author)}</div>
          <div class="book-desc">${escapeHtml(book.desc)}</div>
          <div class="book-footer">
            <div class="price-box">
              ${oldPriceHtml}
              <span class="price">${formatPrice(Number(book.price))}</span>
            </div>
            <button class="add-cart-btn" onclick="addToCart(event, ${book.id})" aria-label="أضف إلى السلة">أضف للسلة</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function goToBook(id) {
  window.location.href = `book.html?id=${encodeURIComponent(id)}`;
}

function toggleFavorite(e, id) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  let favorites = JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  const idx = favorites.indexOf(id);
  if (idx > -1) favorites.splice(idx, 1);
  else favorites.push(id);
  try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch (err) {}
  renderBooks(currentList);
  renderFeaturedBooks();
}

function addToCart(e, id) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  const book = books.find(b => b.id === id);
  if (book) {
    cart.push(book);
    saveCart();
    updateCartUI();
    // open cart drawer
    document.getElementById("cartDrawer").classList.add("open");
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById("count");
  if (countEl) countEl.textContent = cart.length;
  const listElem = document.getElementById("cartItemsList");
  if (!listElem) return;

  if (cart.length === 0) {
    listElem.innerHTML = `<p style="color:var(--muted);text-align:center;padding:20px;">السلة فارغة حالياً.</p>`;
    document.getElementById("subtotalPrice").textContent = formatPrice(0);
    document.getElementById("totalPrice").textContent = formatPrice(0);
    return;
  }

  listElem.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <span>${escapeHtml(item.title)}</span>
      <div style="display:flex;gap:15px;align-items:center;">
        <b>${formatPrice(Number(item.price))}</b>
        <button class="remove-btn" onclick="removeFromCart(${idx})" aria-label="إزالة من السلة">×</button>
      </div>
    </div>
  `).join('');

  let subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  let total = subtotal + shippingFee;

  document.getElementById("subtotalPrice").textContent = formatPrice(subtotal);
  document.getElementById("totalPrice").textContent = formatPrice(total);
}

function getOrderDetails() {
  if (cart.length === 0) {
    alert("السلة فارغة!");
    return null;
  }

  let name = document.getElementById("custName").value.trim();
  let phone = document.getElementById("custPhone").value.trim();
  let address = document.getElementById("custAddress").value.trim();

  if (!name || !phone || !address) {
    alert("يرجى إدخال (الاسم، رقم الموبايل، والعنوان بالتفصيل) لإتمام الطلب بنجاح.");
    return null;
  }

  let booksListText = cart.map(item => `- ${item.title} (${item.price} ج.م)`).join('\n');
  let subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  let total = subtotal + shippingFee;

  let message = `🛒 *طلب جديد من موقع Taleora*\n\n`;
  message += `👤 *الاسم:* ${name}\n`;
  message += `📞 *الموبايل:* ${phone}\n`;
  message += `📍 *العنوان:* ${address} (شامل التوصيل لمحافظات مصر)\n\n`;
  message += `📚 *الكتب المطلوبة:*\n${booksListText}\n\n`;
  message += `📦 *مجموع الكتب:* ${subtotal} ج.م\n`;
  message += `🚚 *مصاريف الشحن:* ${shippingFee} ج.م\n`;
  message += `💰 *الإجمالي الكلي:* ${total} ج.م`;

  return { name, phone, message };
}

function resetCartAndInputs() {
  cart = [];
  try {
    localStorage.removeItem(CART_KEY);
  } catch (e) {}
  document.getElementById("custName").value = "";
  document.getElementById("custPhone").value = "";
  document.getElementById("custAddress").value = "";
  updateCartUI();
  document.getElementById("cartDrawer").classList.remove("open");
}

function safeOpen(url) {
  const w = window.open(url, '_blank');
  if (w) try { w.opener = null; } catch (e) {}
}

function checkoutWhatsApp() {
  let order = getOrderDetails();
  if (!order) return;
  const waUrl = `https://wa.me/201055245130?text=${encodeURIComponent(order.message)}`;
  safeOpen(waUrl);
  resetCartAndInputs();
}

function checkoutTelegram() {
  let order = getOrderDetails();
  if (!order) return;
  const tgUrl = `https://t.me/xyo_zakaria_x?text=${encodeURIComponent(order.message)}`;
  safeOpen(tgUrl);
  resetCartAndInputs();
}

function checkoutInstagram() {
  let order = getOrderDetails();
  if (!order) return;
  alert(`شكراً لك يا ${order.name} ❤️\nسيتم توجيهك لصفحة إنستجرام، يرجى إرسال تفاصيل طلبك في رسالة خاصة.`);
  safeOpen("https://www.instagram.com/yahia__160");
  resetCartAndInputs();
}

function handleSearch() {
  let query = document.getElementById("searchInput").value.trim().toLowerCase();
  currentList = (books || []).filter(b => (b.title || '').toLowerCase().includes(query) || (b.author || '').toLowerCase().includes(query));
  document.getElementById("sectionTitle").textContent = "نتائج البحث";
  renderBooks(currentList);
}

function filterByCategory(category, element) {
  document.querySelectorAll('.category-chip').forEach(chip => chip.classList.remove('active'));
  if (element) element.classList.add('active');
  if (category === 'الكل') {
    currentList = books;
    document.getElementById("sectionTitle").textContent = "مكتبة الروايات";
  } else {
    currentList = (books || []).filter(b => b.category === category);
    document.getElementById("sectionTitle").textContent = `تصنيف: ${category}`;
  }
  renderBooks(currentList);
}

function resetFilter() {
  const input = document.getElementById("searchInput");
  if (input) input.value = "";
  currentList = books;
  document.getElementById("sectionTitle").textContent = "مكتبة الروايات";
  renderBooks(currentList);
}

function toggleMenu() { document.getElementById("menuDrawer").classList.toggle("open"); }
function toggleCart() { document.getElementById("cartDrawer").classList.toggle("open"); }

// تهيئة أولية
loadCart();
renderFeaturedBooks();
renderBooks(books || []);
updateCartUI();

// تأكد أن الدوال متاحة عالمياً (ليعمل onclick في HTML)
window.goToBook = goToBook;
window.toggleFavorite = toggleFavorite;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.checkoutWhatsApp = checkoutWhatsApp;
window.checkoutTelegram = checkoutTelegram;
window.checkoutInstagram = checkoutInstagram;
window.handleSearch = handleSearch;
window.filterByCategory = filterByCategory;
window.resetFilter = resetFilter;
window.toggleMenu = toggleMenu;
window.toggleCart = toggleCart;
