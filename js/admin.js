/* ============================================================
   لوحة تحكم مطعم شوكة
   ============================================================ */
const ADMIN_KEY = "shoka_admin_logged";
let db = getDB();

/* ---------- Login ---------- */
const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");

function showDashboard(){ loginScreen.hidden = true; dashboard.hidden = false; renderAll(); }

if(sessionStorage.getItem(ADMIN_KEY)==="1"){ showDashboard(); }

document.getElementById("loginForm").onsubmit = (e) => {
  e.preventDefault();
  const u = document.getElementById("loginUser").value;
  const p = document.getElementById("loginPass").value;
  if(u===db.admin.username && p===db.admin.password){
    sessionStorage.setItem(ADMIN_KEY,"1"); showDashboard();
  } else alert("بيانات الدخول غير صحيحة");
};

document.getElementById("logoutBtn").onclick = () => {
  sessionStorage.removeItem(ADMIN_KEY);
  loginScreen.hidden = false; dashboard.hidden = true;
};

/* ---------- Tabs ---------- */
document.querySelectorAll(".sidebar nav a").forEach(a => {
  a.onclick = (e) => {
    e.preventDefault();
    document.querySelectorAll(".sidebar nav a").forEach(x=>x.classList.remove("active"));
    a.classList.add("active");
    document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active"));
    document.getElementById("tab-"+a.dataset.tab).classList.add("active");
    renderAll();
  };
});

/* ---------- Render All ---------- */
function renderAll(){
  db = getDB();
  renderStats();
  renderProducts();
  renderOrders();
  renderRevenues();
  renderSettings();
}

function renderStats(){
  const total = db.orders.length;
  const today = new Date().toDateString();
  const todayOrders = db.orders.filter(o => new Date(o.createdAt).toDateString()===today).length;
  const sales = db.orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0);
  const newOrders = db.orders.filter(o=>o.status==="new").length;
  document.getElementById("stats").innerHTML = `
    <div class="stat"><div class="label">إجمالي الطلبات</div><div class="value">${total}</div></div>
    <div class="stat"><div class="label">طلبات اليوم</div><div class="value">${todayOrders}</div></div>
    <div class="stat"><div class="label">إجمالي المبيعات</div><div class="value">${sales} ج</div></div>
    <div class="stat"><div class="label">الطلبات الجديدة</div><div class="value">${newOrders}</div></div>
    <div class="stat"><div class="label">عدد المنتجات</div><div class="value">${db.products.length}</div></div>
    <div class="stat"><div class="label">العروض</div><div class="value">${db.products.filter(p=>p.isOffer).length}</div></div>
  `;
}

/* ---------- Products ---------- */
function renderProducts(){
  const el = document.getElementById("productsTable");
  el.innerHTML = `
    <table>
      <thead><tr>
        <th>الصورة</th><th>الاسم</th><th>التصنيف</th><th>السعر</th><th>الحالة</th><th>إجراءات</th>
      </tr></thead>
      <tbody>
        ${db.products.map(p=>`
          <tr>
            <td><img src="${fixDriveImage(p.image)}" alt=""></td>
            <td>${p.name}</td>
            <td>${db.categories.find(c=>c.id===p.category)?.name||p.category}</td>
            <td>${p.price} ج</td>
            <td>${p.available?"متاح":"مخفي"} ${p.popular?"⭐":""} ${p.isOffer?"🔥":""}</td>
            <td>
              <div class="actions">
                <button class="mini edit" data-edit="${p.id}">تعديل</button>
                <button class="mini toggle" data-toggle="${p.id}">${p.available?"إخفاء":"إظهار"}</button>
                <button class="mini delete" data-del="${p.id}">حذف</button>
              </div>
            </td>
          </tr>`).join("")}
      </tbody>
    </table>`;

  el.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openProductModal(b.dataset.edit));
  el.querySelectorAll("[data-toggle]").forEach(b=>b.onclick=()=>{
    const p = db.products.find(x=>x.id===b.dataset.toggle);
    p.available = !p.available; saveDB(db); renderProducts();
  });
  el.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{
    if(confirm("تأكيد حذف المنتج؟")){
      db.products = db.products.filter(x=>x.id!==b.dataset.del);
      saveDB(db); renderAll();
    }
  });
}

/* ---------- Product Modal ---------- */
const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");

document.getElementById("addProductBtn").onclick = ()=> openProductModal();
document.getElementById("closeProductModal").onclick = ()=> productModal.classList.remove("show");

function openProductModal(id){
  const p = id ? db.products.find(x=>x.id===id) : {
    id:"p"+Date.now(), name:"", desc:"", price:0, category:"pizza", image:"", available:true, popular:false, isOffer:false
  };
  document.getElementById("productModalTitle").textContent = id ? "تعديل منتج" : "إضافة منتج";
  productForm.innerHTML = `
    <label>الاسم <input name="name" value="${p.name}" required></label>
    <label>الوصف <input name="desc" value="${p.desc}"></label>
    <label>السعر <input type="number" name="price" value="${p.price}" required></label>
    <label>رابط الصورة <input name="image" value="${p.image}" placeholder="https://drive.google.com/file/d/..."></label>
    <label>التصنيف
      <select name="category">
        ${db.categories.map(c=>`<option value="${c.id}" ${c.id===p.category?"selected":""}>${c.name}</option>`).join("")}
      </select>
    </label>
    <div class="checkbox-row">
      <label><input type="checkbox" name="available" ${p.available?"checked":""}> متاح</label>
      <label><input type="checkbox" name="popular" ${p.popular?"checked":""}> الأكثر طلبًا</label>
      <label><input type="checkbox" name="isOffer" ${p.isOffer?"checked":""}> عرض</label>
    </div>
    <button type="submit" class="btn btn-primary">حفظ</button>
  `;
  productForm.onsubmit = (e)=>{
    e.preventDefault();
    const fd = new FormData(productForm);
    const updated = {
      id: p.id,
      name: fd.get("name"), desc: fd.get("desc"),
      price: +fd.get("price"), category: fd.get("category"),
      image: fd.get("image"), available: !!fd.get("available"),
      popular: !!fd.get("popular"), isOffer: !!fd.get("isOffer")
    };
    const idx = db.products.findIndex(x=>x.id===p.id);
    if(idx>-1) db.products[idx] = updated; else db.products.push(updated);
    saveDB(db);
    productModal.classList.remove("show");
    renderAll();
  };
  productModal.classList.add("show");
}

/* ---------- Orders ---------- */
const statuses = { new:"جديد", confirmed:"تم التأكيد", preparing:"قيد التحضير", delivering:"خرج للتوصيل", delivered:"تم التسليم", cancelled:"ملغي" };
const typeLabel = t => ({ delivery:"توصيل", pickup:"استلام", dinein:"داخل المطعم" }[t]||t);

function renderOrders(){
  const el = document.getElementById("ordersList");
  if(!db.orders.length){
    el.innerHTML = `<p style="color:#999">لا توجد طلبات بعد.</p>`; return;
  }
  el.innerHTML = db.orders.map(o=>`
    <div class="order-card">
      <h4>طلب ${o.id} — ${typeLabel(o.type)}</h4>
      <p>العميل: ${o.customer.name} — ${o.customer.phone}</p>
      <p>الوقت: ${new Date(o.createdAt).toLocaleString("ar-EG")}</p>
      <p>المنتجات: ${o.items.map(i=>`${i.qty}×${i.name}`).join("، ")}</p>
      <p>الإجمالي: <strong>${o.total} جنيه</strong></p>
      ${o.type==="delivery"?`<p>العنوان: ${o.customer.address} - ${o.customer.area} - ${o.customer.landmark}</p>`:""}
      ${o.type==="dinein"?`<p>رقم الطاولة: ${o.customer.table}</p>`:""}
      <select data-order="${o.id}">
        ${Object.entries(statuses).map(([k,v])=>`<option value="${k}" ${k===o.status?"selected":""}>${v}</option>`).join("")}
      </select>
    </div>`).join("");

  el.querySelectorAll("select[data-order]").forEach(s=>s.onchange=()=>{
    const o = db.orders.find(x=>x.id===s.dataset.order);
    o.status = s.value;
    saveDB(db); renderStats();
  });
}

/* ---------- Revenues ---------- */
function renderRevenues(){
  const revenues = db.revenues || [];
  const totalRevenue = revenues.reduce((s,r)=>s+r.amount,0);
  const today = new Date().toDateString();
  const todayRevenue = revenues.filter(r=>new Date(r.date).toDateString()===today).reduce((s,r)=>s+r.amount,0);

  const statsEl = document.getElementById("revenueStats");
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat"><div class="label">إجمالي الإيرادات المسجلة</div><div class="value">${totalRevenue} ج</div></div>
      <div class="stat"><div class="label">إيرادات اليوم</div><div class="value">${todayRevenue} ج</div></div>
      <div class="stat"><div class="label">عدد العمليات</div><div class="value">${revenues.length}</div></div>
    `;
  }

  const listEl = document.getElementById("revenuesList");
  if (!listEl) return;

  if (!revenues.length) {
    listEl.innerHTML = `<p style="color:#999">لا توجد إيرادات مسجلة بعد.</p>`;
    return;
  }

  listEl.innerHTML = `
    <table>
      <thead><tr>
        <th>التاريخ</th><th>الوصف</th><th>المبلغ</th><th>إجراءات</th>
      </tr></thead>
      <tbody>
        ${revenues.map((r, i) => `
          <tr>
            <td>${new Date(r.date).toLocaleString("ar-EG")}</td>
            <td>${r.description || "-"}</td>
            <td>${r.amount} ج</td>
            <td>
              <button class="mini delete" onclick="deleteRevenue(${i})">حذف</button>
            </td>
          </tr>`).join("")}
      </tbody>
    </table>
  `;
}

function addRevenue(){
  const desc = prompt("وصف الإيراد (مثال: طلب توصيل):");
  if (desc === null) return;
  const amountStr = prompt("المبلغ (بالجنيه):");
  if (amountStr === null) return;
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) { alert("مبلغ غير صالح"); return; }

  const fresh = getDB();
  fresh.revenues = fresh.revenues || [];
  fresh.revenues.unshift({
    date: new Date().toISOString(),
    description: desc || "إيراد يدوي",
    amount: amount
  });
  saveDB(fresh);
  db = getDB();
  renderRevenues();
  renderStats();
}

function deleteRevenue(index){
  if (!confirm("تأكيد حذف هذا الإيراد؟")) return;
  const fresh = getDB();
  fresh.revenues.splice(index, 1);
  saveDB(fresh);
  db = getDB();
  renderRevenues();
  renderStats();
}

/* ---------- Settings ---------- */
function renderSettings(){
  const s = db.settings;
  document.getElementById("settingsForm").innerHTML = `
    <label>اسم المطعم <input name="restaurantName" value="${s.restaurantName}"></label>
    <label>رقم الهاتف <input name="phone" value="${s.phone}"></label>
    <label>رقم واتساب <input name="whatsapp" value="${s.whatsapp}"></label>
    <label>العنوان <input name="address" value="${s.address}"></label>
    <label>مواعيد العمل <input name="workingHours" value="${s.workingHours}"></label>
    <label>رابط Facebook <input name="facebookUrl" value="${s.facebookUrl||""}" placeholder="اتركه فارغًا إن لم يتوفر"></label>
    <label>رابط Google Maps <input name="mapsUrl" value="${s.mapsUrl}"></label>
    <label>رسوم التوصيل <input type="number" name="deliveryFee" value="${s.deliveryFee}"></label>
    <label>الحد الأدنى للطلب <input type="number" name="minOrder" value="${s.minOrder}"></label>
    <button type="submit" class="btn btn-primary">حفظ الإعدادات</button>
  `;
  document.getElementById("settingsForm").onsubmit = (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    db.settings = { ...db.settings,
      restaurantName: fd.get("restaurantName"), phone: fd.get("phone"),
      whatsapp: fd.get("whatsapp"), address: fd.get("address"),
      workingHours: fd.get("workingHours"), facebookUrl: fd.get("facebookUrl"),
      mapsUrl: fd.get("mapsUrl"), deliveryFee: +fd.get("deliveryFee"),
      minOrder: +fd.get("minOrder")
    };
    saveDB(db);
    alert("تم حفظ الإعدادات ✅");
    renderAll();
  };
}