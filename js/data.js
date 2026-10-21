/* ============================================================
   بيانات مطعم شوكة - ملف مبسط لصاحب المطعم
   ============================================================
   
   ✅ كيف تضيف منتج جديد؟
   1. انسخ أي منتج من القائمة (من { إلى },).
   2. الصقه في المكان اللي يعجبك.
   3. غير الاسم، الوصف، السعر، والصورة.
   4. غيّر الـ id (مثلاً من p1 إلى p10) حتى لا يتكرر.
   5. اعمل Refresh للموقع.
   
   ✅ كيف تضيف مقاسات لمنتج؟
   أضف خاصية sizes بداخل المنتج هكذا:
   sizes: [
     { label: "صغير", price: 120 },
     { label: "وسط", price: 180 },
     { label: "كبير", price: 240 }
   ]
   وإذا لم يكن هناك مقاسات، احذف خاصية sizes بالكامل.
   
   ✅ كيف تضيف صورة من Google Drive؟
   1. افتح الصورة في Google Drive.
   2. كليك يمين > مشاركة > "أي شخص لديه الرابط".
   3. انسخ الرابط (شكله: https://drive.google.com/file/d/XXXXXXX/view?usp=sharing).
   4. الصقه في خانة image. الموقع سيصلحه تلقائيًا.
   ============================================================ */

const DEFAULT_DATA = {
  settings: {
    restaurantName: "مطعم شوكة",
    tagline: "طعم يستاهل التجربة",
    phone: "01007760265",
    whatsapp: "01007760265",
    address: "مول النيل بلازا، الظهير الصحراوي، الصالحية الجديدة، محافظة الشرقية، مصر",
    plusCode: "JWMM+P3",
    workingHours: "مفتوح حتى 4:00 صباحًا",
    facebookUrl: "",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=مول+النيل+بلازا+الظهير+الصحراوي+الصالحية+الجديدة",
    deliveryFee: 15,
    minOrder: 50,
    rating: 5.0,
    reviewsCount: 2,
    icons: {/*
      logo: "🍕",
      rating: "⭐",
      delivery: "🚚",
      hours: "🌙",
      pizza: "🍕"*/
    },
    // 🔥 شريط العروض (البانر)
    banner: {
      active: true,
      title: "عرض الافتتاح",
      text: "خصم 20% على جميع البيتزا حتى نهاية الأسبوع",
      image: "",
      link: "#menu"
    }
  },

  // 🔥 نصوص الأقسام (تعدل من هنا)
  texts: {
    menuTitle: "المنيو",
    menuDesc: "اختر من أشهى الأطباق",
    offersTitle: "عروض شوكة",
    offersDesc: "أفضل العروض والخصومات",
    popularTitle: "الأكثر طلبًا",
    popularDesc: "أشهر أطباقنا"
  },

  categories: [
    { id: "pizza",    name: "البيتزا",     /*  icon: "🍕"*/ },
    { id: "burger",   name: "البرجر",     /*  icon: "🍔"*/ },
    { id: "crepe",    name: "الكريب",      /* icon: "🌯"*/ },
    { id: "sides",    name: "المقبلات",   /*  icon: "🍟" */},
    { id: "drinks",   name: "المشروبات",   /* icon: "🥤" */},
    { id: "offers",   name: "العروض",     /*  icon: "🔥" */},
    { id: "popular",  name: "الأكثر طلبًا",/* icon: "⭐" */}
  ],

  // ============================================================
  // ⚠️ المنتجات - عدل هنا
  // ============================================================
  products: [
    {
      id: "p1",
      name: "بيتزا ميكس جبن",
      desc: "مزيج من أجود أنواع الجبن",
      price: 180,
      category: "pizza",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
      available: true,
      popular: true,
      isOffer: false,
      sizes: [
        { label: "صغير", price: 120 },
        { label: "وسط",  price: 180 },
        { label: "كبير", price: 240 }
      ]
    },
    {
      id: "p2",
      name: "بيتزا مارجريتا",
      desc: "صلصة طماطم وموتزاريلا طازجة",
      price: 150,
      category: "pizza",
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
      available: true,
      popular: true,
      isOffer: false,
      sizes: [
        { label: "صغير", price: 100 },
        { label: "وسط",  price: 150 },
        { label: "كبير", price: 200 }
      ]
    },
    {
      id: "p3",
      name: "بيتزا سجق",
      desc: "سجق شرقي مع فلفل ألوان",
      price: 200,
      category: "pizza",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
      available: true,
      popular: false,
      isOffer: false,
      sizes: [
        { label: "وسط",  price: 200 },
        { label: "كبير", price: 260 }
      ]
    },
    {
      id: "b1",
      name: "برجر لحم",
      desc: "قطعة لحم مع جبن شيدر",
      price: 120,
      category: "burger",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
      available: true,
      popular: true,
      isOffer: false
    },
    {
      id: "b2",
      name: "برجر دجاج",
      desc: "دجاج مقرمش مع صوص خاص",
      price: 100,
      category: "burger",
      image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80",
      available: true,
      popular: false,
      isOffer: false
    },
    {
      id: "c1",
      name: "كريب فراخ",
      desc: "كريب محشو بالفراخ والجبن",
      price: 90,
      category: "crepe",
      image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&q=80",
      available: true,
      popular: false,
      isOffer: false,
      sizes: [
        { label: "عادي", price: 90 },
        { label: "دوبل", price: 140 }
      ]
    },
    {
      id: "s1",
      name: "بطاطس مقلية",
      desc: "بطاطس مقرمشة",
      price: 40,
      category: "sides",
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80",
      available: true,
      popular: true,
      isOffer: false,
      sizes: [
        { label: "صغير", price: 40 },
        { label: "كبير", price: 60 }
      ]
    },
    {
      id: "d1",
      name: "بيبسي",
      desc: "مشروب غازي بارد",
      price: 20,
      category: "drinks",
      image: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=600&q=80",
      available: true,
      popular: false,
      isOffer: false
    },
    {
      id: "o1",
      name: "عرض البيتزا",
      desc: "بيتزا + بطاطس + مشروب",
      price: 250,
      category: "offers",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
      available: true,
      popular: false,
      isOffer: true
    }
  ],

  reviews: [
    { text: "احسن مطعم في الصالحية الجديدة", source: "Google", demo: false }
  ],

  admin: { username: "admin", password: "shoka2024" }
};

// ============================================================
// إدارة البيانات (لا تعدل هنا)
// ============================================================
const ORDERS_KEY = "shoka_orders";
const REVENUES_KEY = "shoka_revenues";

function getDB() {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  const revenues = JSON.parse(localStorage.getItem(REVENUES_KEY) || "[]");
  return { ...DEFAULT_DATA, orders, revenues };
}

function saveDB(db) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(db.orders || []));
  localStorage.setItem(REVENUES_KEY, JSON.stringify(db.revenues || []));
}

function initDB() { /* لا تفعل شيئًا */ }

// ============================================================
// إصلاح روابط صور Google Drive تلقائيًا
// ============================================================
function fixDriveImage(url) {
  if (!url) return url;
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=))([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match) {
    const fileId = match[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return url;
}
