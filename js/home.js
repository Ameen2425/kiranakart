import { KiranaKart_API_BASE } from './config.js';

// These variables grab the specific sections in our HTML where we want to insert products
let offersGrid = document.querySelector("#offers .product-grid");
let popularGrid = document.querySelector("#popular .product-grid");
let flashGrid = document.querySelector("#flash-sale .product-grid");

function formatMoney(amount) {
  // Utility function to easily turn a raw number into a formatted price string (e.g. $10.00)
  return `$${amount.toFixed(2)}`;
}

function getBadgeClass(badgeText) {
  if (badgeText.startsWith("-")) {
    return "badge-danger";
  }
  if (badgeText === "New") {
    return "badge-success";
  }
  if (badgeText === "Bestseller") {
    return "badge-accent";
  }
  if (badgeText === "Trending") {
    return "badge-info";
  }
  return "badge-warning";
}

function createFullCardHtml(product) {
  let wishlisted = KiranaKartStorage.isWishlisted(product.id);
  let badgeClass = getBadgeClass(product.badge);
  let badgeLabel = product.badge.startsWith("-")
    ? product.badge
    : `-${product.discountPct}%`;
  let isChecked = wishlisted ? "checked" : "";
  let imageSrc = product.frontImage ? product.frontImage : "";

  return `
      <article class="item-box">
        <div class="card-media">
          <span class="badge ${badgeClass} card-badge">${badgeLabel}</span>
          <label class="card-wishlist" aria-label="Add ${product.name} to wishlist">
            <input type="checkbox" data-wishlist-toggle="${product.id}" ${isChecked} />
            <i class="fa-solid fa-heart"></i>
          </label>
          <img src="${imageSrc}" alt="${product.name}" width="400" height="400" loading="lazy" />
          <div class="card-overlay">
            <a href="product-detail.html?id=${product.id}" class="card-quickview">Quick View</a>
          </div>
        </div>
        <div class="card-body">
          <span class="card-category">${product.categoryLabel}</span>
          <h3 class="card-title">${product.name}</h3>
          <div class="card-rating">
            <i class="fa-solid fa-star star-filled" style="font-size: 11px;"></i>
            ${product.rating} <span>(${product.reviewCount})</span>
          </div>
          <div class="card-price-row">
            <span class="card-price">${formatMoney(product.price)}</span>
            <span class="card-price-old">${formatMoney(product.oldPrice)}</span>
            <span class="card-discount">Save ${product.discountPct}%</span>
          </div>
        </div>
        <div class="card-footer">
          <button type="button" class="card-add-btn" data-add-to-cart="${product.id}">
            <i class="fa-solid fa-cart-shopping"></i>
            Add to Cart
          </button>
        </div>
      </article>`;
}

function createFlashCardHtml(product) {
  let imageSrc = product.frontImage ? product.frontImage : "";

  return `
      <article class="item-box">
        <div class="card-media">
          <span class="badge badge-danger card-badge">-${product.discountPct}%</span>
          <img src="${imageSrc}" alt="${product.name}" width="400" height="400" loading="lazy" />
        </div>
        <div class="card-body">
          <span class="card-category">${product.categoryLabel}</span>
          <h3 class="card-title">${product.name}</h3>
          <div class="card-price-row">
            <span class="card-price">${formatMoney(product.price)}</span>
            <span class="card-price-old">${formatMoney(product.oldPrice)}</span>
          </div>
        </div>
        <div class="card-footer">
          <button type="button" class="card-add-btn" data-add-to-cart="${product.id}">
            <i class="fa-solid fa-cart-shopping"></i>
            Add to Cart
          </button>
        </div>
      </article>`;
}

function getCategoryIcon(slug) {
  const icons = {
    'vegetables': 'carrot',
    'fruits': 'apple-whole',
    'groceries': 'basket-shopping',
    'dairy': 'cow',
    'bakery': 'bread-slice',
    'snacks': 'cookie',
    'beverages': 'bottle-water',
    'frozen-foods': 'snowflake',
    'personal-care': 'pump-soap',
    'household': 'spray-can'
  };
  return icons[slug] || 'box';
}

async function initCategories() {
  const slider = document.getElementById("category-slider");
  if (!slider) return;

  try {
    // We use "await fetch" to grab category data from our remote API server
    const response = await fetch(`${KiranaKart_API_BASE}/categories`);
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const categories = await response.json();
    
    slider.innerHTML = categories.map(cat => `
      <a href="products.html#${cat.slug}" class="category-card">
        <span class="category-card-icon">
          <i class="fa-solid fa-${getCategoryIcon(cat.slug)}"></i>
        </span>
        <span class="category-card-name">${cat.label}</span>
        <span class="category-card-count">${cat.productCount}+ items</span>
      </a>
    `).join("");
  } catch (error) {
    console.warn("KiranaKart home.js: could not load categories from API", error);
  }
}

async function initHomePage() {
  // First, load categories into the slider
  await initCategories();

  // If there are no product grids on this page, stop running the script here
  if (!offersGrid && !popularGrid && !flashGrid) {
    return;
  }

  let allProducts = [];

  try {
    let response = await fetch(`${KiranaKart_API_BASE}/products?limit=100`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    let data = await response.json();
    allProducts = data.products;
  } catch (error) {
    console.warn(
      "KiranaKart home.js: could not load products from API, keeping static cards.",
      error,
    );
    return;
  }

  if (offersGrid) {
    // Sort all products from highest discount to lowest
    let sortedByDiscount = [...allProducts].sort(function (a, b) {
      return b.discountPct - a.discountPct;
    });
    // Take the top 4 and render them
    let offers = sortedByDiscount.slice(0, 4);
    offersGrid.innerHTML = offers.map(createFullCardHtml).join("");
  }

  if (popularGrid) {
    let sortedByReviews = [...allProducts].sort(function (a, b) {
      return b.reviewCount - a.reviewCount;
    });
    let popular = sortedByReviews.slice(0, 4);
    popularGrid.innerHTML = popular.map(createFullCardHtml).join("");
  }

  if (flashGrid) {
    let sortedByDiscount = [...allProducts].sort(function (a, b) {
      return b.discountPct - a.discountPct;
    });
    let highDiscount = sortedByDiscount.filter(function (product) {
      return product.discountPct >= 15;
    });
    let flash = highDiscount.slice(4, 8);
    flashGrid.innerHTML = flash.map(createFlashCardHtml).join("");
  }
}

initHomePage();
