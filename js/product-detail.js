import { KiranaKart_API_BASE } from './config.js';

// Extract the product ID from the web address (URL) so we know which product to display
let titleEl = document.getElementById("pdp-title");
let params = new URLSearchParams(window.location.search);
let productId = Number(params.get("id"));

let qty = 1;
let qtyValueEl = document.getElementById("pdp-qty-value");
let qtyDecBtn = document.getElementById("pdp-qty-dec");
let qtyIncBtn = document.getElementById("pdp-qty-inc");

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function handleDecreaseQty() {
  qty = Math.max(1, qty - 1);
  if (qtyValueEl) {
    qtyValueEl.textContent = String(qty);
  }
}

function handleIncreaseQty() {
  qty += 1;
  if (qtyValueEl) {
    qtyValueEl.textContent = String(qty);
  }
}

if (qtyDecBtn) {
  qtyDecBtn.addEventListener("click", handleDecreaseQty);
}

if (qtyIncBtn) {
  qtyIncBtn.addEventListener("click", handleIncreaseQty);
}

function renderProduct(product) {
  // Update the page title and the main heading with the product's name
  document.title = `${product.name} | KiranaKart`;
  if (titleEl) {
    titleEl.textContent = product.name;
  }

  document.getElementById("pdp-category").textContent = product.categoryLabel;

  let catLink = document.getElementById("pdp-category-link");
  catLink.textContent = product.categoryLabel;
  catLink.href = `products.html#${product.category}`;

  document.getElementById("pdp-breadcrumb-name").textContent = product.name;
  document.getElementById("pdp-rating").textContent = product.rating;
  document.getElementById("pdp-reviews").textContent =
    `(${product.reviewCount} reviews)`;

  document.getElementById("pdp-price").textContent = formatMoney(product.price);
  document.getElementById("pdp-old-price").textContent = formatMoney(
    product.oldPrice,
  );
  document.getElementById("pdp-badge").textContent =
    `Save ${product.discountPct}%`;

  document.getElementById("pdp-description").textContent = product.description;
  document.getElementById("pdp-long-description").textContent =
    product.longDescription;
  document.getElementById("pdp-delivery").textContent =
    `${product.deliveryMins}–${product.deliveryMins + 5} mins`;

  let featuresList = product.features.map(function (feature) {
    return `<li><svg class="icon" aria-hidden="true"><use href="#icon-check"></use></svg>${feature}</li>`;
  });
  document.getElementById("pdp-features").innerHTML = featuresList.join("");

  let iconFront = document.getElementById("pdp-icon-front");
  let photoFront = document.getElementById("pdp-photo-front");
  let mediaFront = document.getElementById("pdp-media-front");

  if (product.frontImage) {
    photoFront.src = product.frontImage;
    photoFront.alt = product.name;
    photoFront.style.display = "block";
    iconFront.style.display = "none";
    mediaFront.style.background = "var(--bg-muted)";
  } else {
    photoFront.style.display = "none";
    iconFront.style.display = "";
    iconFront.innerHTML = `<use href="#${product.icon}"></use>`;
    mediaFront.style.background = "var(--gradient-primary)";
  }

  let iconBack = document.getElementById("pdp-icon-back");
  let photoBack = document.getElementById("pdp-photo-back");
  let mediaBack = document.getElementById("pdp-media-back");

  if (product.backImage) {
    photoBack.src = product.backImage;
    photoBack.alt = `${product.name} — alternate view`;
    photoBack.style.display = "block";
    iconBack.style.display = "none";
    mediaBack.style.background = "var(--bg-muted)";
  } else {
    photoBack.style.display = "none";
    iconBack.style.display = "";
    iconBack.innerHTML = `<use href="#${product.backIcon}"></use>`;
    mediaBack.style.background = `var(--gradient-${product.backGradient})`;
  }

  let wishlistToggle = document.getElementById("pdp-wishlist-toggle");
  wishlistToggle.checked = KiranaKartStorage.isWishlisted(product.id);
  wishlistToggle.addEventListener("change", function () {
    KiranaKartStorage.toggleWishlist(product.id);
  });

  let addBtn = document.getElementById("pdp-add-cart");
  let buyBtn = document.getElementById("pdp-buy-now");

  addBtn.addEventListener("click", function () {
    KiranaKartStorage.addToCart(product.id, qty);

    let originalText = addBtn.innerHTML;
    addBtn.innerHTML = `<svg class="icon" style="width:18px; height:18px;" aria-hidden="true"><use href="#icon-check"></use></svg> Added to Cart`;

    setTimeout(function () {
      addBtn.innerHTML = originalText;
    }, 1400);
  });

  buyBtn.addEventListener("click", function () {
    KiranaKartStorage.addToCart(product.id, qty);
    window.location.href = "cart.html";
  });
}

async function loadProductPage() {
  if (!titleEl) {
    return;
  }

  if (!productId) {
    titleEl.textContent = "Product not found";
    document.getElementById("pdp-description").textContent =
      "No product id was given in the URL.";
    return;
  }

  try {
    let response = await fetch(`${KiranaKart_API_BASE}/products?limit=100`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    let data = await response.json();
    let product = data.products.find(function (p) {
      return p.id === productId;
    });

    if (!product) {
      throw new Error(`No product with id ${productId}`);
    }

    renderProduct(product);
  } catch (err) {
    titleEl.textContent = "Product not found";
    document.getElementById("pdp-description").textContent =
      `Couldn't load this product. ${err.message}`;
  }
}

loadProductPage();
