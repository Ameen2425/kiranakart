import { KiranaKart_API_BASE } from './config.js';

let layout = document.getElementById("cart-layout");
let itemsList = document.getElementById("cart-items-list");
let emptyState = document.getElementById("cart-empty-state");
let itemCountLabel = document.getElementById("cart-item-count-label");
let subtotalEl = document.getElementById("cart-subtotal");
let discountEl = document.getElementById("cart-discount");
let totalEl = document.getElementById("cart-total");

let products = [];

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function createCartItemHtml(item, product) {
  let lineTotal = product.price * item.qty;
  let lineOldTotal = product.oldPrice * item.qty;

  let bgStyle = "";
  let mediaHtml = "";

  if (product.frontImage) {
    mediaHtml = `<img src="${product.frontImage}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;" />`;
  } else {
    bgStyle = "background: var(--gradient-primary);";
    mediaHtml = `<svg class="icon" style="width:40px; height:40px; color:var(--color-white);" aria-hidden="true"><use href="#${product.icon}"></use></svg>`;
  }

  return `
      <article class="cart-box" data-cart-item="${product.id}">
        <div class="cart-item-media" style="${bgStyle} display:grid; place-items:center; overflow:hidden;">
            ${mediaHtml}
        </div>
        <div class="cart-item-body">
            <div class="cart-item-top">
                <div>
                    <span class="card-category">${product.categoryLabel}</span>
                    <h3 style="font-size:var(--fs-md);">
                        <a href="product-detail.html?id=${product.id}" style="color:inherit;">${product.name}</a>
                    </h3>
                </div>
                <button type="button" class="cart-box-remove" data-remove="${product.id}" aria-label="Remove ${product.name} from cart">
                    <svg class="icon" width="20" height="20" aria-hidden="true"><use href="#icon-trash"></use></svg>
                </button>
            </div>
            <div class="cart-item-footer">
                <div class="qty-stepper" role="group" aria-label="Quantity for ${product.name}">
                    <button type="button" class="qty-stepper-btn" data-dec="${product.id}" aria-label="Decrease quantity">&minus;</button>
                    <span class="qty-stepper-value">${item.qty}</span>
                    <button type="button" class="qty-stepper-btn" data-inc="${product.id}" aria-label="Increase quantity">+</button>
                </div>
                <div>
                    <strong style="font-size:var(--fs-lg);">${formatMoney(lineTotal)}</strong> 
                    <span class="card-price-old">${formatMoney(lineOldTotal)}</span>
                </div>
            </div>
        </div>
      </article>`;
}

function renderCart() {
  if (!layout) {
    return;
  }

  // Get the current cart items from local storage
  let cart = KiranaKartStorage.getCart();

  if (cart.length === 0) {
    layout.style.display = "none";
    if (emptyState) {
      emptyState.style.display = "flex";
    }
    return;
  }

  layout.style.display = "block";
  if (emptyState) {
    emptyState.style.display = "none";
  }

  let itemCount = 0;
  let subtotal = 0;
  let oldSubtotal = 0;

  let validCartItems = cart.map(function (item) {
    let matchedProduct = products.find(function (p) {
      return p.id === item.id;
    });

    if (matchedProduct) {
      itemCount += item.qty;
      subtotal += matchedProduct.price * item.qty;
      oldSubtotal += matchedProduct.oldPrice * item.qty;
      return createCartItemHtml(item, matchedProduct);
    }
    return "";
  });

  if (itemsList) {
    itemsList.innerHTML = validCartItems.join("");
  }

  let discount = oldSubtotal - subtotal;
  if (discount < 0) {
    discount = 0;
  }

  if (itemCountLabel) {
    let plural = itemCount === 1 ? "" : "s";
    itemCountLabel.textContent = `Subtotal (${itemCount} item${plural})`;
  }

  if (subtotalEl) {
    subtotalEl.textContent = formatMoney(subtotal);
  }

  if (discountEl) {
    discountEl.textContent = `-${formatMoney(discount)}`;
  }

  if (totalEl) {
    totalEl.textContent = formatMoney(subtotal);
  }
}

function handleCartActions(event) {
  // Figure out which button the user clicked (remove, increase, or decrease)
  let removeBtn = event.target.closest("[data-remove]");
  let incBtn = event.target.closest("[data-inc]");
  let decBtn = event.target.closest("[data-dec]");

  if (removeBtn) {
    let id = Number(removeBtn.dataset.remove);
    KiranaKartStorage.removeFromCart(id);
  }

  if (incBtn) {
    let id = Number(incBtn.dataset.inc);
    KiranaKartStorage.incrementCartItem(id);
  }

  if (decBtn) {
    let id = Number(decBtn.dataset.dec);
    KiranaKartStorage.decrementCartItem(id);
  }
}

if (itemsList) {
  itemsList.addEventListener("click", handleCartActions);
}

// Listen for our custom event so we can automatically re-render the cart when items change
document.addEventListener("kiranakart:cart-updated", function () {
  renderCart();
});

async function initCartPage() {
  if (!layout) {
    return;
  }

  try {
    let response = await fetch(`${KiranaKart_API_BASE}/products?limit=100`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    let data = await response.json();
    products = data.products;

    renderCart();
  } catch (err) {
    if (itemsList) {
      itemsList.innerHTML = `<p class="text-muted">Couldn't reach the KiranaKart API.</p>`;
    }
  }
}

initCartPage();
