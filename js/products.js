import { KiranaKart_API_BASE } from './config.js';

// Grab references to HTML elements that we will interact with
var grid = document.getElementById("product-grid");
var categoryHeading = document.getElementById("category-heading");
var filterChipsWrap = document.getElementById("filter-chips");
var searchInput = document.getElementById("site-search");
var searchForm = null;
if (searchInput != null) {
  searchForm = searchInput.closest("form");
}
var sortSelect = document.getElementById("sort-select");
var resultsSummary = document.getElementById("results-summary");

var CATEGORY_LABELS_all = "All Products";
var CATEGORY_LABELS_vegetables = "Vegetables";
var CATEGORY_LABELS_fruits = "Fruits";
var CATEGORY_LABELS_groceries = "Groceries";
var CATEGORY_LABELS_dairy = "Dairy";
var CATEGORY_LABELS_bakery = "Bakery";
var CATEGORY_LABELS_snacks = "Snacks";
var CATEGORY_LABELS_beverages = "Beverages";
var CATEGORY_LABELS_frozen_foods = "Frozen Foods";
var CATEGORY_LABELS_personal_care = "Personal Care";
var CATEGORY_LABELS_household = "Household";

function getCategoryLabel(cat) {
  if (cat == "vegetables") return CATEGORY_LABELS_vegetables;
  if (cat == "fruits") return CATEGORY_LABELS_fruits;
  if (cat == "groceries") return CATEGORY_LABELS_groceries;
  if (cat == "dairy") return CATEGORY_LABELS_dairy;
  if (cat == "bakery") return CATEGORY_LABELS_bakery;
  if (cat == "snacks") return CATEGORY_LABELS_snacks;
  if (cat == "beverages") return CATEGORY_LABELS_beverages;
  if (cat == "frozen-foods") return CATEGORY_LABELS_frozen_foods;
  if (cat == "personal-care") return CATEGORY_LABELS_personal_care;
  if (cat == "household") return CATEGORY_LABELS_household;
  return CATEGORY_LABELS_all;
}

// Check the current URL to see if a category, search query, or sort option is already selected
var urlStr = window.location.search;
var currentCategory = "all";
var currentSearch = "";
var currentSort = "";

if (window.location.hash != "") {
  currentCategory = window.location.hash.replace("#", "");
}
if (urlStr.indexOf("q=") > -1) {
  currentSearch = urlStr.split("q=")[1].split("&")[0];
}

if (
  getCategoryLabel(currentCategory) == CATEGORY_LABELS_all &&
  currentCategory != "all"
) {
  currentCategory = "all";
}
if (searchInput != null && currentSearch != "") {
  searchInput.value = currentSearch;
}

function money(v) {
  return "$" + v.toFixed(2);
}

function productMediaHtml(p, isBack) {
  var imgSrc = "";
  if (isBack == true) {
    if (p.backImage != null) {
      imgSrc = p.backImage;
    } else {
      imgSrc = p.frontImage;
    }
  } else {
    imgSrc = p.frontImage;
  }

  if (imgSrc != null && imgSrc != "") {
    var label = p.name;
    if (isBack == true) {
      label = p.name + " — alternate view";
    }
    return (
      "<img src='" +
      imgSrc +
      "' alt='" +
      label +
      "' loading='lazy' style='width:100%; height:100%; object-fit:cover;' />"
    );
  }

  var icon = "";
  if (isBack == true) {
    icon = p.backIcon;
  } else {
    icon = p.icon;
  }
  var bg = "";
  if (isBack == true) {
    bg = "var(--gradient-" + p.backGradient + ")";
  } else {
    bg = "var(--gradient-primary)";
  }

  var out =
    "<div style='width:100%; height:100%; display:grid; place-items:center; background:" +
    bg +
    ";'>";
  out =
    out +
    "<span style='width:64px; height:64px; border-radius:var(--radius-md); background:hsla(0,0%,100%,0.18); display:grid; place-items:center; color:var(--color-white);'>";
  out =
    out +
    "<svg class='icon' style='width:34px; height:34px;' aria-hidden='true'><use href='#" +
    icon +
    "'></use></svg>";
  out = out + "</span></div>";
  return out;
}

function cardHtml(p) {
  var wishlisted = KiranaKartStorage.isWishlisted(p.id);
  var badgeClass = "badge-warning";

  if (p.badge == "-20%" || p.badge.indexOf("-") == 0) {
    badgeClass = "badge-danger";
  } else if (p.badge == "New") {
    badgeClass = "badge-success";
  } else if (p.badge == "Bestseller") {
    badgeClass = "badge-accent";
  } else if (p.badge == "Trending") {
    badgeClass = "badge-info";
  }

  var bodyHtml = "<div class='card-body'>";
  bodyHtml =
    bodyHtml + "<span class='card-category'>" + p.categoryLabel + "</span>";
  bodyHtml = bodyHtml + "<h3 class='card-title'>" + p.name + "</h3>";
  bodyHtml = bodyHtml + "<p class='card-desc'>" + p.description + "</p>";
  bodyHtml = bodyHtml + "<div class='card-rating'>";
  bodyHtml =
    bodyHtml +
    "<svg class='icon star-filled' style='width:13px; height:13px;' aria-hidden='true'><use href='images/icons.svg#icon-star'></use></svg>";
  bodyHtml =
    bodyHtml + " " + p.rating + " <span>(" + p.reviewCount + ")</span>";
  bodyHtml = bodyHtml + "</div>";
  bodyHtml = bodyHtml + "<div class='card-price-row'>";
  bodyHtml =
    bodyHtml + "<span class='card-price'>" + money(p.price) + "</span>";
  bodyHtml =
    bodyHtml + "<span class='card-price-old'>" + money(p.oldPrice) + "</span>";
  bodyHtml =
    bodyHtml + "<span class='card-discount'>Save " + p.discountPct + "%</span>";
  bodyHtml = bodyHtml + "</div>";
  bodyHtml = bodyHtml + "<div class='card-delivery'>";
  bodyHtml =
    bodyHtml +
    "<svg class='icon' style='width:14px; height:14px;' aria-hidden='true'><use href='images/icons.svg#icon-clock'></use></svg>";
  bodyHtml = bodyHtml + " Delivery in " + p.deliveryMins + " mins";
  bodyHtml = bodyHtml + "</div></div>";
  bodyHtml = bodyHtml + "<div class='card-footer'>";
  bodyHtml =
    bodyHtml +
    "<button type='button' class='card-add-btn' data-add-to-cart='" +
    p.id +
    "'>";
  bodyHtml =
    bodyHtml +
    "<svg class='icon' style='width:16px; height:16px;' aria-hidden='true'><use href='images/icons.svg#icon-cart'></use></svg> Add to Cart";
  bodyHtml = bodyHtml + "</button></div>";

  var isChecked = "";
  if (wishlisted == true) {
    isChecked = "checked";
  }

  if (p.isAuto == true) {
    var out =
      "<article class='item-box flip-card flip-card-auto' data-cat='" +
      p.category +
      "' data-product-id='" +
      p.id +
      "'>";
    out =
      out +
      "<div class='flip-card-inner'><div class='flip-card-face flip-card__face--front'>";
    out = out + "<div class='card-media'>";
    out =
      out +
      "<span class='badge " +
      badgeClass +
      " card-badge'>" +
      p.badge +
      "</span>";
    out =
      out +
      "<a href='product-detail.html?id=" +
      p.id +
      "' class='card-quickview-btn'><svg class='icon' style='width:17px; height:17px;' aria-hidden='true'><use href='images/icons.svg#icon-eye'></use></svg></a>";
    out = out + "<label class='card-wishlist'>";
    out =
      out +
      "<input type='checkbox' data-wishlist-toggle='" +
      p.id +
      "' " +
      isChecked +
      " />";
    out =
      out +
      "<svg class='icon' style='width:17px; height:17px;' aria-hidden='true'><use href='images/icons.svg#icon-heart'></use></svg>";
    out = out + "</label>";
    out = out + productMediaHtml(p, false);
    out = out + "</div>" + bodyHtml + "</div>";

    out = out + "<div class='flip-card-face flip-card-face-back'>";
    out = out + "<h4>" + p.name + "</h4><p>" + p.longDescription + "</p><ul>";
    for (var i = 0; i < p.features.length; i++) {
      out =
        out +
        "<li><svg class='icon' aria-hidden='true'><use href='images/icons.svg#icon-check'></use></svg>" +
        p.features[i] +
        "</li>";
    }
    out = out + "</ul>";
    out =
      out +
      "<button type='button' class='button btn-outline-light small-button' data-add-to-cart='" +
      p.id +
      "'>";
    out =
      out +
      "<svg class='icon' style='width:16px; height:16px;' aria-hidden='true'><use href='images/icons.svg#icon-cart'></use></svg> Add to Cart";
    out = out + "</button></div></div></article>";
    return out;
  }

  var finalOut =
    "<article class='item-box' data-cat='" +
    p.category +
    "' data-product-id='" +
    p.id +
    "'>";
  finalOut = finalOut + "<div class='card-media card-media-flip'>";
  finalOut =
    finalOut +
    "<span class='badge " +
    badgeClass +
    " card-badge'>" +
    p.badge +
    "</span>";
  finalOut =
    finalOut +
    "<a href='product-detail.html?id=" +
    p.id +
    "' class='card-quickview-btn'><svg class='icon' style='width:17px; height:17px;' aria-hidden='true'><use href='images/icons.svg#icon-eye'></use></svg></a>";
  finalOut = finalOut + "<label class='card-wishlist'>";
  finalOut =
    finalOut +
    "<input type='checkbox' data-wishlist-toggle='" +
    p.id +
    "' " +
    isChecked +
    " />";
  finalOut =
    finalOut +
    "<svg class='icon' style='width:17px; height:17px;' aria-hidden='true'><use href='images/icons.svg#icon-heart'></use></svg>";
  finalOut = finalOut + "</label>";
  finalOut = finalOut + "<div class='card-media-inner'>";
  finalOut =
    finalOut +
    "<div class='card-media-face product-card__media-face--front'>" +
    productMediaHtml(p, false) +
    "</div>";
  finalOut =
    finalOut +
    "<div class='card-media-face card-media-face-back'>" +
    productMediaHtml(p, true) +
    "</div>";
  finalOut = finalOut + "</div></div>" + bodyHtml + "</article>";
  return finalOut;
}

function render(products) {
  if (grid == null) return;
  if (products.length == 0) {
    grid.innerHTML =
      "<p class='text-muted' style='grid-column:1/-1; text-align:center; padding:var(--space-2xl) 0;'>No products matched your search. Try a different keyword or category.</p>";
    if (resultsSummary != null) resultsSummary.textContent = "";
    return;
  }

  var groupByCategory = false;
  if (currentCategory == "all" && currentSearch == "") {
    groupByCategory = true;
  }

  var allHtml = "";
  if (groupByCategory == false) {
    for (var j = 0; j < products.length; j++) {
      allHtml = allHtml + cardHtml(products[j]);
    }
    grid.innerHTML = allHtml;
  } else {

    var catArrays = {};
    for (var k = 0; k < products.length; k++) {
      var p = products[k];
      if (catArrays[p.category] == null) {
        catArrays[p.category] = [];
      }
      catArrays[p.category].push(p);
    }

    var cats = [
      "vegetables",
      "fruits",
      "groceries",
      "dairy",
      "bakery",
      "snacks",
      "beverages",
      "frozen-foods",
      "personal-care",
      "household",
    ];
    for (var c = 0; c < cats.length; c++) {
      var categoryName = cats[c];
      var items = catArrays[categoryName];
      if (items != null && items.length > 0) {
        allHtml =
          allHtml +
          "<h3 class='product-grid-section-heading'>" +
          getCategoryLabel(categoryName) +
          "</h3>";
        for (var l = 0; l < items.length; l++) {
          allHtml = allHtml + cardHtml(items[l]);
        }
      }
    }
    grid.innerHTML = allHtml;
  }

  if (resultsSummary != null) {
    var plural = "s";
    if (products.length == 1) plural = "";
    var msg = "Showing " + products.length + " product" + plural;
    if (currentCategory != "all") {
      msg = msg + " in " + getCategoryLabel(currentCategory);
    }
    if (currentSearch != "") {
      msg = msg + " for '" + currentSearch + "'";
    }
    msg = msg + ".";
    resultsSummary.textContent = msg;
  }
}

function updateChipStyles() {
  if (filterChipsWrap == null) return;
  var chips = filterChipsWrap.querySelectorAll("[data-filter-chip]");
  for (var i = 0; i < chips.length; i++) {
    var chip = chips[i];
    if (chip.getAttribute("data-filter-chip") == currentCategory) {
      chip.classList.add("is-active");
    } else {
      chip.classList.remove("is-active");
    }
  }
}

function updateHeading() {
  if (categoryHeading != null) {
    categoryHeading.textContent = getCategoryLabel(currentCategory);
  }
}

var requestToken = 0;

async function fetchAndRender() {
  // requestToken ensures we only render data from the latest network request (avoids race conditions)
  requestToken = requestToken + 1;
  var myToken = requestToken;

  if (grid != null) {
    grid.setAttribute("aria-busy", "true");
  }

  var url = KiranaKart_API_BASE + "/products?limit=100";
  if (currentCategory != "all") {
    url = url + "&category=" + currentCategory;
  }
  if (currentSearch != "") {
    url = url + "&search=" + currentSearch;
  }
  if (currentSort != "") {
    url = url + "&sort=" + currentSort;
  }

  try {
    // We use "await fetch" to get the filtered products from the API
    let response = await fetch(url);
    if (myToken != requestToken) return;
    if (response.ok) {
      let data = await response.json();
      render(data.products);
    } else {
      throw new Error(`API returned ${response.status}`);
    }
  } catch (error) {
    if (myToken != requestToken) return;
    if (grid != null) {
      grid.innerHTML =
        "<p class='text-muted' style='grid-column:1/-1; text-align:center;'>Couldn't reach the KiranaKart API.</p>";
    }
  } finally {
    if (myToken == requestToken) {
      if (grid != null) grid.removeAttribute("aria-busy");
      updateChipStyles();
      updateHeading();
    }
  }
}

if (filterChipsWrap != null) {
  filterChipsWrap.onclick = function (e) {
    var chip = e.target;
    while (chip != null && chip.getAttribute("data-filter-chip") == null) {
      chip = chip.parentElement;
    }
    if (chip != null) {
      currentCategory = chip.getAttribute("data-filter-chip");
      var newUrl = "products.html";
      if (currentCategory != "all") {
        newUrl = newUrl + "#" + currentCategory;
      }
      window.location.hash = currentCategory == "all" ? "" : currentCategory;
      fetchAndRender();
    }
  };
}

if (searchForm != null) {
  searchForm.onsubmit = function (e) {
    e.preventDefault();
    currentSearch = searchInput.value;
    fetchAndRender();
  };
}

if (searchInput != null) {
  var debounceTimeout = null;
  searchInput.onkeyup = function () {
    if (debounceTimeout != null) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(function () {
      currentSearch = searchInput.value;
      fetchAndRender();
    }, 300);
  };
}

if (sortSelect != null) {
  sortSelect.onchange = function () {
    currentSort = sortSelect.value;
    fetchAndRender();
  };
}

window.onhashchange = function () {
  var next = window.location.hash;
  if (next != "") {
    next = next.replace("#", "");
  } else {
    next = "all";
  }
  currentCategory = next;
  fetchAndRender();
};

if (grid != null) {
  fetchAndRender();
}
