/* ============================================================
   منطق الموقع الرئيسي - مطعم شوكة
   ============================================================ */
let db = getDB();
let cart = JSON.parse(localStorage.getItem("shoka_cart") || "[]");
let currentCategory = "pizza";

/* ---------- Render helpers ---------- */
function money(n){ return `${n} جنيه`; }

// عرض بطاقة المنتج (مع اختيار المقاس إذا كان موجودًا)
function productCard(p){
  const hasSizes = p.sizes && p.sizes.length > 0;
  const defaultPrice = hasSizes ? Math.min(...p.sizes.map(s => s.price)) : p.price;
  const priceLabel = hasSizes ? `من ${money(defaultPrice)}` : money(p.price);
  
  let sizesHtml = "";
  if (hasSizes) {
    sizesHtml = `
      <div class="sizes-options" data-product="${p.id}">
        ${p.sizes.map((s, idx) => `
          <label class="size-option">
            <input type="radio" name="size_${p.id}" value="${idx}" ${idx === 0 ? "checked" : ""}>
            <span>${s.label} - ${money(s.price)}</span>
          </label>
        `).join("")}
      </div>
    `;
  }
  
  return `
    <div class="card">
      <img src="${fixDriveImage(p.image)}" alt="${p.name}" loading="lazy">
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        ${sizesHtml}
        <div class="card-footer">
          <span class="price">${priceLabel}</span>
          <button class="add-btn" data-id="${p.id}">+ أضف للسلة</button>
        </div>
      </div>
    </div>`;
}

// إضافة منتج للسلة مع مراعاة المقاس
function addToCart(productId, sizeIndex = 0){
  const prod = db.products.find(p => p.id === productId);
  if (!prod) return;
  
  const hasSizes = prod.sizes && prod.sizes.length > 0;
  const size = hasSizes ? prod.sizes[sizeIndex] : null;
  const price = hasSizes ? size.price : prod.price;
  const cartItemId = hasSizes ? `${productId}_${sizeIndex}` : productId;
  const cartItemName = hasSizes ? `${prod.name} (${size.label})` : prod.name;
  
  const item = cart.find(c => c.id === cartItemId);
  if (item) item.qty++;
  else cart.push({ id: cartItemId, name: cartItemName, price, qty: 1 });
  
  saveCart();
  openCart();
}

// ربط زر "أضف للسلة" مع قراءة المقاس المختار
function bindAddButtons(scope){
  scope.querySelectorAll(".add-btn").forEach(b => {
    b.onclick = () => {
      const productId = b.dataset.id;
      const radio = scope.querySelector(`input[name="size_${productId}"]:checked`);
      const sizeIndex = radio ? parseInt(radio.value) : 0;
      addToCart(productId, sizeIndex);
    };
  });
}

function renderTabs(){
  const tabs = document.getElementById("menuTabs");
  const mainCats = db.categories.filter(c => !["offers","popular"].includes(c.id));
  tabs.innerHTML = mainCats
    .map(c => `<button class="tab ${c.id===currentCategory?'active':''}" data-cat="${c.id}">${c.icon ? c.icon + ' ' : ''}${c.name}</button>`)
    .join("");
  tabs.querySelectorAll(".tab").forEach(t => t.onclick = () => {
    currentCategory = t.dataset.cat;
    renderTabs(); renderMenu();
  });
}

function renderMenu(){
  const grid = document.getElementById("menuGrid");
  const list = db.products.filter(p => p.category===currentCategory && p.available);
  grid.innerHTML = list.length ? list.map(productCard).join("") : `<p style="grid-column:1/-1;text-align:center;color:#999">لا توجد منتجات في هذا التصنيف حاليًا.</p>`;
  bindAddButtons(grid);
}

function renderOffers(){
  const grid = document.getElementById("offersGrid");
  const list = db.products.filter(p => p.isOffer && p.available);
  grid.innerHTML = list.length ? list.map(productCard).join("") : `<p style="grid-column:1/-1;text-align:center;color:#bbb">لا توجد عروض حاليًا.</p>`;
  bindAddButtons(grid);
}

function renderPopular(){
  const grid = document.getElementById("popularGrid");
  const list = db.products.filter(p => p.popular && p.available);
  grid.innerHTML = list.length ? list.map(productCard).join("") : `<p style="grid-column:1/-1;text-align:center;color:#999">لا توجد منتجات مميزة حاليًا.</p>`;
  bindAddButtons(grid);
}

/* ---------- Cart ---------- */
function saveCart(){
  localStorage.setItem("shoka_cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById("cartCount").textContent = count;
  const itemsEl = document.getElementById("cartItems");
  if(!cart.length){
    itemsEl.innerHTML = `<p style="text-align:center;color:#999;padding:40px 0">السلة فارغة</p>`;
  } else {
    itemsEl.innerHTML = cart.map(i => `
      <div class="cart-item">
        <div>
          <h4>${i.name}</h4>
          <div class="qty">
            <button data-act="minus" data-id="${i.id}">−</button>
            <span>${i.qty}</span>
            <button data-act="plus" data-id="${i.id}">+</button>
          </div>
        </div>
        <div style="text-align:left">
          <div class="line-total">${money(i.price*i.qty)}</div>
          <button class="remove" data-act="remove" data-id="${i.id}">حذف</button>
        </div>
      </div>`).join("");
    itemsEl.querySelectorAll("button").forEach(b => b.onclick = () => {
      const id = b.dataset.id, act = b.dataset.act;
      const item = cart.find(c=>c.id===id);
      if(act==="plus") item.qty++;
      if(act==="minus"){ item.qty--; if(item.qty<=0) cart = cart.filter(c=>c.id!==id); }
      if(act==="remove") cart = cart.filter(c=>c.id!==id);
      saveCart();
    });
  }
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const delivery = subtotal>0 ? db.settings.deliveryFee : 0;
  document.getElementById("cartSubtotal").textContent = money(subtotal);
  document.getElementById("cartDelivery").textContent = money(delivery);
  document.getElementById("cartTotal").textContent = money(subtotal+delivery);
  document.getElementById("checkoutBtn").disabled = cart.length===0;
}

/* ---------- Drawer controls ---------- */
const drawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
function openCart(){ drawer.classList.add("open"); overlay.classList.add("show"); }
function closeCart(){ drawer.classList.remove("open"); overlay.classList.remove("show"); }
document.getElementById("cartToggle").onclick = openCart;
document.getElementById("closeCart").onclick = closeCart;
overlay.onclick = closeCart;

/* ---------- Checkout ---------- */
const checkoutModal = document.getElementById("checkoutModal");
const successModal = document.getElementById("successModal");
document.getElementById("checkoutBtn").onclick = () => {
  if(!cart.length) return;
  closeCart();
  checkoutModal.classList.add("show");
};
document.getElementById("closeCheckout").onclick = () => checkoutModal.classList.remove("show");

const form = document.getElementById("checkoutForm");
const deliveryFields = document.getElementById("deliveryFields");
const pickupFields = document.getElementById("pickupFields");
const dineinFields = document.getElementById("dineinFields");
document.getElementById("pickupAddress").textContent = db.settings.address;

form.querySelectorAll('input[name="orderType"]').forEach(r => r.onchange = () => {
  const v = form.orderType.value;
  deliveryFields.hidden = v!=="delivery";
  pickupFields.hidden = v!=="pickup";
  dineinFields.hidden = v!=="dinein";
});

let customerLocation = null;
document.getElementById("geoBtn").onclick = () => {
  const status = document.getElementById("geoStatus");
  if(!navigator.geolocation){ status.textContent = "المتصفح لا يدعم تحديد الموقع"; return; }
  status.textContent = "جاري تحديد موقعك...";
  navigator.geolocation.getCurrentPosition(pos => {
    customerLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    status.textContent = `تم تحديد الموقع: ${customerLocation.lat.toFixed(5)}, ${customerLocation.lng.toFixed(5)}`;
  }, () => status.textContent = "تعذر تحديد الموقع، يمكنك كتابة العنوان يدويًا.");
};

form.onsubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const type = fd.get("orderType");
  if(type==="delivery" && !fd.get("address")){ alert("من فضلك أدخل العنوان"); return; }
  if(type==="dinein" && !fd.get("table")){ alert("من فضلك أدخل رقم الطاولة"); return; }

  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const delivery = type==="delivery" ? db.settings.deliveryFee : 0;
  const total = subtotal + delivery;
  const order = {
    id: "SH" + Date.now().toString().slice(-6),
    createdAt: new Date().toISOString(),
    status: "new",
    customer: {
      name: fd.get("name"), phone: fd.get("phone"),
      address: fd.get("address")||"", area: fd.get("area")||"", landmark: fd.get("landmark")||"",
      table: fd.get("table")||"",
      location: customerLocation
    },
    type, items: [...cart], subtotal, delivery, total
  };

  const fresh = getDB();
  fresh.orders.unshift(order);
  saveDB(fresh);

  checkoutModal.classList.remove("show");
  document.getElementById("orderNumber").textContent = order.id;
  document.getElementById("orderDetails").innerHTML = `
    <p>النوع: ${typeLabel(type)}</p>
    <p>الإجمالي: <strong>${money(total)}</strong></p>
    <ul style="text-align:right;margin:14px auto;max-width:280px">
      ${order.items.map(i=>`<li>${i.qty} × ${i.name} — ${money(i.price*i.qty)}</li>`).join("")}
    </ul>`;

  const msg = buildWhatsapp(order);
  const waNum = db.settings.whatsapp.replace(/^0/,"20").replace(/\D/g,"");
  document.getElementById("sendWhatsapp").href = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

  successModal.classList.add("show");
  cart = [];
  saveCart();
};

function typeLabel(t){
  return { delivery:"توصيل", pickup:"استلام من المطعم", dinein:"داخل المطعم" }[t];
}

function buildWhatsapp(o){
  return `مرحبًا مطعم شوكة

أريد طلب:

${o.items.map(i=>`${i.qty} × ${i.name}`).join("\n")}

نوع الطلب:
${typeLabel(o.type)}

اسم العميل:
${o.customer.name}

رقم الهاتف:
${o.customer.phone}

${o.type==="delivery"?`العنوان:\n${o.customer.address} - ${o.customer.area} - ${o.customer.landmark}`:""}
${o.type==="dinein"?`رقم الطاولة: ${o.customer.table}`:""}

الإجمالي:
${o.total} جنيه

رقم الطلب: ${o.id}`;
}

/* ---------- Load restaurant info, Icons, Banner & Texts ---------- */
function loadInfo(){
  const s = db.settings;

  // الشعار
  if (s.icons && s.icons.logo) {
    document.querySelectorAll('.logo').forEach(el => {
      const text = el.textContent.replace(s.icons.logo, '').trim();
      el.innerHTML = `${s.icons.logo} ${text}`;
    });
  }

  // شارة التقييم
  if (s.icons && s.icons.rating) {
    const badge = document.querySelector('.hero-badge');
    if (badge) badge.innerHTML = `${s.icons.rating} ${s.rating} تقييم العملاء`;
  }

  // معلومات الـ Hero
  if (s.icons) {
    const heroInfo = document.querySelector('.hero-info');
    if (heroInfo) {
      heroInfo.innerHTML = `
        <span>${s.icons.pizza || ''} مطعم بيتزا</span>
        <span>${s.icons.delivery || ''} خدمة توصيل</span>
        <span>${s.icons.hours || ''} مفتوح حتى 4 صباحًا</span>
      `;
    }
  }

  // 🔥 تحديث نصوص الأقسام من الداتا
  if (db.texts) {
    if (document.getElementById("offersTitle")) document.getElementById("offersTitle").textContent = db.texts.offersTitle;
    if (document.getElementById("offersDesc")) document.getElementById("offersDesc").textContent = db.texts.offersDesc;
    if (document.getElementById("popularTitle")) document.getElementById("popularTitle").textContent = db.texts.popularTitle;
    if (document.getElementById("popularDesc")) document.getElementById("popularDesc").textContent = db.texts.popularDesc;
    if (document.getElementById("menuTitle")) document.getElementById("menuTitle").textContent = db.texts.menuTitle;
    if (document.getElementById("menuDesc")) document.getElementById("menuDesc").textContent = db.texts.menuDesc;
  }

  // بيانات المطعم
  document.getElementById("infoName").textContent = s.restaurantName;
  document.getElementById("infoAddress").textContent = s.address;
  document.getElementById("infoPhone").textContent = s.phone;
  document.getElementById("infoPhone").href = "tel:"+s.phone;
  document.getElementById("infoHours").textContent = s.workingHours;
  document.getElementById("infoRating").textContent = `${s.rating} / 5 (${s.reviewsCount} مراجعة)`;
  document.getElementById("directionsBtn").href = s.mapsUrl;
  document.getElementById("mapFrame").src = `https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`;

  const fb = document.getElementById("facebookBtn");
  if(s.facebookUrl){
    fb.href = s.facebookUrl; fb.style.display = "inline-flex";
  } else {
    fb.onclick = (e)=>{ e.preventDefault(); alert("سيتم إضافة رابط صفحة Facebook قريبًا."); };
  }

  document.querySelectorAll('a[href^="tel:"]').forEach(a => a.href = "tel:"+s.phone);
  document.querySelectorAll('.float-btn.call').forEach(a => a.href = "tel:"+s.phone);
  const wa = s.whatsapp.replace(/^0/,"20").replace(/\D/g,"");
  document.getElementById("floatWhatsapp").href = `https://wa.me/${wa}`;

  // التقييمات
  document.getElementById("reviewsMeta").textContent = `${s.rating} / 5 — عدد المراجعات: ${s.reviewsCount} (Google)`;
  document.getElementById("reviewsList").innerHTML = db.reviews.map(r => `
    <div class="review">
      <div class="stars">★★★★★</div>
      <p>"${r.text}"</p>
      <small>${r.demo?"مراجعة تجريبية DEMO":`مصدر: ${r.source}`}</small>
    </div>`).join("");

  // البانر
  const bannerEl = document.getElementById("banner");
  if (bannerEl) {
    const banner = s.banner;
    if (banner && banner.active) {
      bannerEl.style.display = "block";
      document.getElementById("bannerTitle").textContent = banner.title || "";
      document.getElementById("bannerText").textContent = banner.text || "";
      const link = document.getElementById("bannerLink");
      link.href = banner.link || "#menu";
      if (banner.image) {
        link.style.backgroundImage = `url(${fixDriveImage(banner.image)})`;
        link.style.backgroundSize = "cover";
        link.style.backgroundPosition = "center";
      }
    } else {
      bannerEl.style.display = "none";
    }
  }

  document.getElementById("year").textContent = new Date().getFullYear();
}

/* ---------- Navbar mobile ---------- */
document.getElementById("hamburger").onclick = () => {
  document.getElementById("navLinks").classList.toggle("open");
};
document.querySelectorAll("#navLinks a").forEach(a => a.onclick = () => {
  document.getElementById("navLinks").classList.remove("open");
});
window.addEventListener("scroll", () => {
  document.getElementById("navbar").classList.toggle("scrolled", window.scrollY>20);
});

/* ---------- Init ---------- */
renderTabs();
renderMenu();
renderOffers();
renderPopular();
updateCartUI();
loadInfo();