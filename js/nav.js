function updateCartBadges() {
  // Get the total number of items in the cart
  let count = KiranaKartStorage.getCartCount();
  // Find all the little badge elements in the navigation bar that display the count
  let badgeElements = document.querySelectorAll("[data-cart-count]");

  badgeElements.forEach(function (el) {
    el.textContent = String(count);

    let pill = el.closest(".badge");
    if (!pill) {
      pill = el;
    }

    if (count > 0) {
      pill.style.display = "";
    } else {
      pill.style.display = "none";
    }
  });
}

function updateAccountMenu() {
  // Check if a user is currently logged in
  let user = KiranaKartStorage.getCurrentUser();
  let panel = document.querySelector("[data-account-panel]");

  if (!panel) {
    return;
  }

  if (user) {
    let safeName = escapeHtml(user.name);
    panel.innerHTML = `
            <div style="padding: var(--space-2xs) var(--space-sm); font-size: var(--fs-xs); color: var(--text-muted);">
                Signed in as <strong style="color:var(--text-primary);">${safeName}</strong>
            </div>
            <a href="cart.html">
                <svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-cart"></use></svg>
                My Cart
            </a>
            <button type="button" data-logout-btn style="display:flex; align-items:center; gap:var(--space-2xs); width:100%; text-align:left; padding: var(--space-2xs) var(--space-sm); border-radius: var(--radius-sm); font-size: var(--fs-sm); font-weight: var(--fw-medium); color: var(--color-danger);">
                <svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-close"></use></svg>
                Logout
            </button>
        `;

    let logoutBtn = panel.querySelector("[data-logout-btn]");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        KiranaKartStorage.logout();
        window.location.href = "index.html";
      });
    }
  }
}

function escapeHtml(str) {
  let tempDiv = document.createElement("div");
  tempDiv.textContent = str;
  return tempDiv.innerHTML;
}

function handleGlobalClick(event) {
  // Listen for clicks on any "Add to Cart" button across the whole website
  let addBtn = event.target.closest("[data-add-to-cart]");
  if (addBtn) {
    let productId = Number(addBtn.dataset.addToCart);
    KiranaKartStorage.addToCart(productId, 1);

    let originalText = addBtn.innerHTML;
    addBtn.innerHTML = `<svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-check"></use></svg> Added`;

    setTimeout(function () {
      addBtn.innerHTML = originalText;
    }, 1200);
  }
}

function handleWishlistToggle(event) {
  let toggle = event.target.closest("[data-wishlist-toggle]");
  if (toggle) {
    let productId = Number(toggle.dataset.wishlistToggle);
    KiranaKartStorage.toggleWishlist(productId);
  }
}

function bindGlobalProductActions() {
  document.addEventListener("click", handleGlobalClick);
  document.addEventListener("change", handleWishlistToggle);

  let wishlistToggles = document.querySelectorAll("[data-wishlist-toggle]");
  wishlistToggles.forEach(function (el) {
    let productId = Number(el.dataset.wishlistToggle);
    el.checked = KiranaKartStorage.isWishlisted(productId);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  updateCartBadges();
  updateAccountMenu();
  bindGlobalProductActions();
  initCountdowns();
});

document.addEventListener("kiranakart:cart-updated", function () {
  updateCartBadges();
});

function initCountdowns() {
  // Find all countdown timers on the page (like the one in the flash sale section)
  let countdowns = document.querySelectorAll(".countdown");
  if (countdowns.length === 0) return;

  countdowns.forEach(function (el) {
    let units = el.querySelectorAll(".countdown-unit");
    if (units.length === 0) return;

    let totalSeconds = 0;

    units.forEach(unit => {
      let numEl = unit.querySelector(".countdown-num");
      let labelEl = unit.querySelector(".countdown-label");
      if (!numEl || !labelEl) return;

      let val = parseInt(numEl.textContent, 10) || 0;
      let label = labelEl.textContent.trim().toLowerCase();

      if (label.includes("day")) totalSeconds += val * 86400;
      else if (label.includes("hr") || label.includes("hour")) totalSeconds += val * 3600;
      else if (label.includes("min")) totalSeconds += val * 60;
      else if (label.includes("sec")) totalSeconds += val;
    });

    let timerId = setInterval(function () {
      if (totalSeconds <= 0) {
        clearInterval(timerId);
        return;
      }

      totalSeconds--;

      let temp = totalSeconds;
      let d = Math.floor(temp / 86400);
      temp %= 86400;
      let h = Math.floor(temp / 3600);
      temp %= 3600;
      let m = Math.floor(temp / 60);
      let s = temp % 60;

      units.forEach(unit => {
        let numEl = unit.querySelector(".countdown-num");
        let labelEl = unit.querySelector(".countdown-label");
        if (!numEl || !labelEl) return;

        let label = labelEl.textContent.trim().toLowerCase();
        let valToDisplay = 0;

        if (label.includes("day")) valToDisplay = d;
        else if (label.includes("hr") || label.includes("hour")) valToDisplay = h;
        else if (label.includes("min")) valToDisplay = m;
        else if (label.includes("sec")) valToDisplay = s;

        numEl.textContent = String(valToDisplay).padStart(2, "0");
      });
    }, 1000);
  });
}
