const imagePool = {
  "T-Shirts": [
    "photo-1521572163474-6864f9cf17ab",
    "photo-1527719327859-c6ce80353573",
    "photo-1503342217505-b0a15ec3261c"
  ],
  "Sneakers": [
    "photo-1542291026-7eec264c27ff",
    "photo-1495555961986-6d4c1ecb7be3",
    "photo-1460353581641-37baddab0fa2"
  ],
  "Hoodies": [
    "photo-1556821840-3a63f95609a7",
    "photo-1551028719-00167b16eac5",
    "photo-1578681994506-b8f463449011"
  ],
  "Accessories": [
    "photo-1523275335684-37898b6baf30",
    "photo-1524805444758-089113d48a6d",
    "photo-1508685096489-7aacd43bd3b1"
  ]
};

const names = {
  "T-Shirts": [
    "Essential Oversized Tee",
    "Graphic Street Tee",
    "Classic Cotton T-Shirt",
    "Neon Logo Tee",
    "Relaxed Fit Tee",
    "Urban Print Tee",
    "Everyday Basic Tee",
    "Retro Graphic Tee",
    "Minimal Crew Tee"
  ],
  "Sneakers": [
    "Pulse Runner Sneakers",
    "Street Court Sneakers",
    "Cloud Walk Trainers",
    "Retro High Sneakers",
    "Urban Flex Sneakers",
    "Classic Low Tops",
    "Velocity Sport Shoes",
    "Mono Street Sneakers",
    "Daily Runner"
  ],
  "Hoodies": [
    "Core Pullover Hoodie",
    "Oversized Chill Hoodie",
    "Zip-Up Street Hoodie",
    "Soft Fleece Hoodie",
    "Neon Signature Hoodie",
    "Campus Hoodie",
    "Relaxed Essential Hoodie",
    "Graphic Drop Hoodie",
    "Everyday Warm Hoodie"
  ],
  "Accessories": [
    "Minimal Dial Watch",
    "Crossbody Bag",
    "Classic Cap",
    "Steel Water Bottle",
    "Retro Sunglasses",
    "Canvas Tote Bag",
    "Silver Chain",
    "Compact Wallet",
    "Sport Socks Pack"
  ]
};

const $ = id => document.getElementById(id);
const money = n => "₹" + n.toLocaleString("en-IN");

const safeRead = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

let products = [];
let cart = safeRead("neonCart", []);
let wishlist = safeRead("neonWish", []);
let nextId = 1;

// Generate 36 products: 9 products per category
Object.keys(names).forEach(cat => {
  names[cat].forEach((name, j) => {
    const base =
      cat === "Sneakers" ? 1599 :
      cat === "Hoodies" ? 999 :
      cat === "Accessories" ? 399 : 499;

    products.push({
      id: nextId++,
      name,
      cat,
      price: base + j * 100,
      old: base + j * 100 + 300,
      rating: (4.1 + (j % 9) * 0.1).toFixed(1),
      img: `https://images.unsplash.com/${imagePool[cat][j % 3]}?auto=format&fit=crop&w=600&q=80`
    });
  });
});

// Save cart and wishlist
function saveState() {
  try {
    localStorage.setItem("neonCart", JSON.stringify(cart));
    localStorage.setItem("neonWish", JSON.stringify(wishlist));
  } catch {}

  updateCounts();
}

function updateCounts() {
  $("cartCount").textContent =
    cart.reduce((sum, item) => sum + item.qty, 0);

  $("wishCount").textContent = wishlist.length;
}

// Notification toast
let toastTimer;

function notify(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// Render products, search and filters
function render() {
  const query = $("search").value.trim().toLowerCase();
  const category = $("categoryFilter").value;
  const sort = $("sort").value;

  let list = products.filter(p =>
    (
      p.name.toLowerCase().includes(query) ||
      p.cat.toLowerCase().includes(query)
    ) &&
    (category === "All" || p.cat === category)
  );

  if (sort === "low") {
    list.sort((a, b) => a.price - b.price);
  }

  if (sort === "high") {
    list.sort((a, b) => b.price - a.price);
  }

  if (sort === "rating") {
    list.sort((a, b) => Number(b.rating) - Number(a.rating));
  }

  $("resultCount").textContent = list.length;

  $("products").innerHTML = list.length
    ? list.map(p => `
      <article class="product">
        <div class="pimg">
          <img loading="lazy" src="${p.img}" alt="${p.name}">

          <span class="tag">
            ${p.id <= 8 ? "NEW DROP" : "NEON PICK"}
          </span>

          <button
            class="heart ${wishlist.includes(p.id) ? "active" : ""}"
            data-wish="${p.id}"
            aria-label="Toggle ${p.name} wishlist">
            <i class="fa-${wishlist.includes(p.id) ? "solid" : "regular"} fa-heart"></i>
          </button>
        </div>

        <div class="info">
          <h3>${p.name}</h3>

          <div class="meta">
            <span class="price">
              ${money(p.price)}
              <small class="old">${money(p.old)}</small>
            </span>

            <span class="rating">
              <i class="fa-solid fa-star"></i> ${p.rating}
            </span>
          </div>

          <div class="product-actions">
            <button class="add" data-add="${p.id}">
              <i class="fa-solid fa-bag-shopping"></i> Add to bag
            </button>

            <button
              class="quick-view"
              data-view="${p.id}"
              aria-label="Quick view ${p.name}">
              <i class="fa-regular fa-eye"></i>
            </button>
          </div>
        </div>
      </article>
    `).join("")
    : `
      <div class="empty-state">
        <i class="fa-solid fa-magnifying-glass"></i>
        <h3 style="margin:12px 0 5px;color:var(--text)">
          No styles found
        </h3>
        <p>Try another search or reset your filters.</p>
      </div>
    `;
}

// Add products to cart
function addCart(id) {
  const item = cart.find(x => x.id === id);

  if (item) {
    item.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }

  saveState();
  notify("Added to your bag ✦");
}

// Add/remove wishlist items
function toggleWish(id) {
  wishlist = wishlist.includes(id)
    ? wishlist.filter(x => x !== id)
    : [...wishlist, id];

  saveState();
  render();

  notify(
    wishlist.includes(id)
      ? "Saved to your wishlist ♥"
      : "Removed from wishlist"
  );
}

// Open and close popup
function openModal(content) {
  $("modalBody").innerHTML = content;
  $("modal").classList.add("open");
  $("modal").setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
  $("modalClose").focus();
}

function closeModal() {
  $("modal").classList.remove("open");
  $("modal").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// Information for store benefit buttons
const infoContent = {
  shipping: {
    icon: "fa-truck-fast",
    title: "Shipping information",
    intro: "A little treat from NEON: shipping is free on demo orders of ₹1,499 or more.",
    points: [
      "Orders below ₹1,499 may show a sample delivery fee at checkout.",
      "Delivery timelines depend on the delivery location.",
      "This is a college project demo; no parcel will actually be shipped."
    ]
  },

  secure: {
    icon: "fa-shield-halved",
    title: "Secure shopping",
    intro: "Your trust matters. This demo keeps shopping interactions on your device and does not collect payment details.",
    points: [
      "No payment gateway is connected.",
      "Do not enter real payment or sensitive personal information.",
      "Cart and wishlist are stored locally in this browser when available."
    ]
  },

  returns: {
    icon: "fa-rotate-left",
    title: "Easy returns",
    intro: "Our sample policy offers a 7-day return window for eligible items, starting from delivery.",
    points: [
      "Keep the item unused and in its original packaging.",
      "In a real store, return eligibility and refund timing would be confirmed by the seller.",
      "This demo cannot create a real return request."
    ]
  },

  support: {
    icon: "fa-headset",
    title: "NEON support desk",
    intro: "Need help finding your fit? This demo support panel shows the kind of help a store could offer.",
    points: [
      "Product browsing and wishlist help: available on this page.",
      "For a real store, add a working email address or support number here.",
      "This project does not have a live 24/7 support team."
    ]
  }
};

// Show benefit information
function showInfo(type) {
  const info = infoContent[type];
  if (!info) return;

  openModal(`
    <span class="modal-kicker">NEON CUSTOMER CARE</span>

    <h2 class="modal-title" id="modalTitle">
      <i class="fa-solid ${info.icon}"
         style="color:var(--purple);margin-right:8px"></i>
      ${info.title}
    </h2>

    <p class="modal-copy">${info.intro}</p>

    <ul class="modal-list">
      ${info.points.map(x => `<li>${x}</li>`).join("")}
    </ul>

    <p class="demo-note">
      Demo information for a student project — not a live store policy.
    </p>

    <button class="btn" style="margin-top:15px" id="infoDone">
      Got it <i class="fa-solid fa-check"></i>
    </button>
  `);

  $("infoDone").addEventListener("click", closeModal);
}

// Shopping cart popup
function showCart() {
  if (!cart.length) {
    openModal(`
      <span class="modal-kicker">YOUR NEON BAG</span>

      <h2 class="modal-title" id="modalTitle">
        Your bag is waiting.
      </h2>

      <p class="modal-copy">
        Looks like you haven't added anything yet.
        Explore the collection and find your next favourite.
      </p>

      <button class="btn" id="continueShopping">
        Explore products <i class="fa-solid fa-arrow-right"></i>
      </button>
    `);

    $("continueShopping").addEventListener("click", () => {
      closeModal();
      location.hash = "#shop";
    });

    return;
  }

  const total = cart.reduce((sum, x) =>
    sum + (products.find(p => p.id === x.id)?.price || 0) * x.qty, 0
  );

  const remaining = Math.max(0, 1499 - total);

  openModal(`
    <span class="modal-kicker">YOUR NEON BAG</span>
    <h2 class="modal-title" id="modalTitle">Looking good already.</h2>

    ${cart.map(x => {
      const p = products.find(y => y.id === x.id);

      return `
        <div class="cart-row">
          <img src="${p.img}" alt="">

          <div class="cart-row-info">
            <strong>${p.name}</strong>
            <small>${money(p.price)} each</small>
          </div>

          <div class="qty-controls">
            <button data-qty="-1" data-id="${p.id}"
              aria-label="Decrease quantity">−</button>

            <span>${x.qty}</span>

            <button data-qty="1" data-id="${p.id}"
              aria-label="Increase quantity">+</button>
          </div>

          <button class="remove-item" data-remove="${p.id}"
            aria-label="Remove ${p.name}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
    }).join("")}

    <p class="modal-copy">
      ${remaining
        ? `Add ${money(remaining)} more to unlock sample free shipping.`
        : "You've reached the sample free-shipping threshold!"}
    </p>

    <div class="cart-total">
      <span>Subtotal</span>
      <span>${money(total)}</span>
    </div>

    <div class="modal-actions">
      <button class="btn" id="checkout">
        Checkout demo <i class="fa-solid fa-arrow-right"></i>
      </button>

      <button class="btn btn-outline" id="clearCart">
        Clear bag
      </button>
    </div>

    <p class="demo-note">
      Demo only: checkout will not take payment or create an order.
    </p>
  `);

  $("checkout").addEventListener("click", () => {
    closeModal();
    notify("Demo checkout — payment is not connected.");
  });

  $("clearCart").addEventListener("click", () => {
    cart = [];
    saveState();
    closeModal();
    notify("Your bag has been cleared.");
  });

  $("modalBody").querySelectorAll("[data-qty]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const item = cart.find(x => x.id === id);

      if (!item) return;

      item.qty += Number(btn.dataset.qty);

      if (item.qty <= 0) {
        cart = cart.filter(x => x.id !== id);
      }

      saveState();
      showCart();
    });
  });

  $("modalBody").querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      cart = cart.filter(x => x.id !== Number(btn.dataset.remove));
      saveState();
      showCart();
    });
  });
}

// Wishlist popup
function showWishlist() {
  const saved = wishlist
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  if (!saved.length) {
    openModal(`
      <span class="modal-kicker">SAVED FOR LATER</span>

      <h2 class="modal-title" id="modalTitle">
        Your wishlist is empty.
      </h2>

      <p class="modal-copy">
        Tap the heart on any product to save it here for later.
      </p>

      <button class="btn" id="wishlistExplore">
        Explore styles <i class="fa-solid fa-arrow-right"></i>
      </button>
    `);

    $("wishlistExplore").addEventListener("click", () => {
      closeModal();
      location.hash = "#shop";
    });

    return;
  }

  openModal(`
    <span class="modal-kicker">SAVED FOR LATER</span>
    <h2 class="modal-title" id="modalTitle">Your wishlist ♥</h2>

    ${saved.map(p => `
      <div class="cart-row">
        <img src="${p.img}" alt="">

        <div class="cart-row-info">
          <strong>${p.name}</strong>
          <small>${money(p.price)}</small>
        </div>

        <button class="btn" data-wish-add="${p.id}">
          Add to bag
        </button>

        <button class="remove-item" data-wish-remove="${p.id}"
          aria-label="Remove from wishlist">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join("")}
  `);

  $("modalBody").querySelectorAll("[data-wish-add]").forEach(b => {
    b.addEventListener("click", () => {
      addCart(Number(b.dataset.wishAdd));
    });
  });

  $("modalBody").querySelectorAll("[data-wish-remove]").forEach(b => {
    b.addEventListener("click", () => {
      wishlist = wishlist.filter(id => id !== Number(b.dataset.wishRemove));
      saveState();
      showWishlist();
      render();
    });
  });
}

// Product quick view
function quickView(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  openModal(`
    <div class="modal-product">
      <img src="${p.img}" alt="${p.name}">

      <div>
        <span class="modal-kicker">${p.cat.toUpperCase()}</span>

        <h2 id="modalTitle">${p.name}</h2>

        <div class="rating">
          <i class="fa-solid fa-star"></i> ${p.rating} / 5
        </div>

        <h2 style="margin-top:15px">
          ${money(p.price)}
          <small class="old">${money(p.old)}</small>
        </h2>

        <p>
          A versatile NEON pick made for everyday styling.
          Pair it with your favourite essentials for an easy streetwear look.
        </p>

        <button class="btn" id="quickAdd">
          Add to bag <i class="fa-solid fa-bag-shopping"></i>
        </button>
      </div>
    </div>
  `);

  $("quickAdd").addEventListener("click", () => {
    addCart(id);
    closeModal();
  });
}

// Category selection
function setCategory(category) {
  $("categoryFilter").value = category;
  render();
  location.hash = "#shop";
}

// Reset filters
function resetFilters() {
  $("search").value = "";
  $("categoryFilter").value = "All";
  $("sort").value = "featured";
  render();
}

// Newsletter demo
function subscribe(event) {
  event.preventDefault();

  const email = $("email").value.trim();
  if (!email) return;

  $("email").value = "";
  notify("Thanks for joining the NEON list ✦ (demo)");
}

// Product button clicks
$("products").addEventListener("click", event => {
  const wish = event.target.closest("[data-wish]");
  const add = event.target.closest("[data-add]");
  const view = event.target.closest("[data-view]");

  if (wish) toggleWish(Number(wish.dataset.wish));
  if (add) addCart(Number(add.dataset.add));
  if (view) quickView(Number(view.dataset.view));
});

// Search, sorting and filters
$("categoryFilter").addEventListener("change", render);
$("sort").addEventListener("change", render);
$("search").addEventListener("input", render);
$("resetFilters").addEventListener("click", resetFilters);

// Header buttons
$("cartButton").addEventListener("click", showCart);
$("wishlistButton").addEventListener("click", showWishlist);

$("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const icon = $("themeToggle").querySelector("i");

  icon.className = document.body.classList.contains("dark")
    ? "fa-solid fa-sun"
    : "fa-regular fa-moon";
});

$("menuToggle").addEventListener("click", () => {
  $("navLinks").classList.toggle("open");
});

$("navLinks").querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    $("navLinks").classList.remove("open");
  });
});

// Clickable benefits and category cards
document.querySelectorAll("[data-info]").forEach(el => {
  el.addEventListener("click", () => showInfo(el.dataset.info));
});

document.querySelectorAll("[data-category]").forEach(el => {
  el.addEventListener("click", () => setCategory(el.dataset.category));
});

// Newsletter form
$("newsletterForm").addEventListener("submit", subscribe);

// Modal controls
$("modalClose").addEventListener("click", closeModal);

$("modal").addEventListener("click", event => {
  if (event.target === $("modal")) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

// Scroll reveal animation
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".reveal").forEach(el => {
    observer.observe(el);
  });
} else {
  document.querySelectorAll(".reveal").forEach(el => {
    el.classList.add("visible");
  });
}

// Start the store
updateCounts();
render();