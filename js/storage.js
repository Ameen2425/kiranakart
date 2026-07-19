// ==================================================
// This file handles saving and retrieving data (like cart and user info)
// from the browser's local storage so it persists even after refreshing the page.
// ==================================================

let KEYS = {
  users: "kiranakart_users",
  currentUser: "kiranakart_current_user",
  cart: "kiranakart_cart",
  wishlist: "kiranakart_wishlist",
};

function readData(key, fallback) {
  // Try to read data from the browser's localStorage, returning fallback if it doesn't exist
  try {
    let data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return fallback;
  } catch (err) {
    console.warn(`Failed to read from localStorage: ${key}`, err);
    return fallback;
  }
}

function writeData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let KiranaKartStorage = {
  // ---------------- Users / Auth ----------------

  getUsers: function () {
    return readData(KEYS.users, []);
  },

  findUserByEmail: function (email) {
    let users = this.getUsers();
    return users.find(function (user) {
      return user.email.toLowerCase() === email.toLowerCase();
    });
  },

  saveUser: function (user) {
    let users = this.getUsers();
    // Check if a user with this email already exists before allowing signup
    let existingUser = this.findUserByEmail(user.email);

    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    users.push(user);
    writeData(KEYS.users, users);
  },

  validateLogin: function (email, password) {
    let user = this.findUserByEmail(email);
    if (!user || user.password !== password) {
      return null;
    }
    return user;
  },

  getCurrentUser: function () {
    let email = readData(KEYS.currentUser, null);
    if (email) {
      return this.findUserByEmail(email);
    }
    return null;
  },

  setCurrentUser: function (email) {
    writeData(KEYS.currentUser, email);
  },

  logout: function () {
    localStorage.removeItem(KEYS.currentUser);
  },

  // ---------------- Cart ----------------

  getCart: function () {
    return readData(KEYS.cart, []);
  },

  saveCart: function (cart) {
    writeData(KEYS.cart, cart);
    // Dispatch a custom event so other parts of the app (like the nav bar) know the cart changed and can update the UI
    let event = new CustomEvent("kiranakart:cart-updated", {
      detail: { cart: cart },
    });
    document.dispatchEvent(event);
  },

  addToCart: function (id, qty = 1) {
    let cart = this.getCart();
    let existingItem = cart.find(function (item) {
      return item.id === id;
    });

    if (existingItem) {
      cart = cart.map(function (item) {
        if (item.id === id) {
          item.qty = item.qty + qty;
        }
        return item;
      });
    } else {
      cart.push({ id: id, qty: qty });
    }

    this.saveCart(cart);
    return cart;
  },

  setQty: function (id, qty) {
    let cart = this.getCart();

    if (qty < 1) {
      cart = cart.filter(function (item) {
        return item.id !== id;
      });
    } else {
      cart = cart.map(function (item) {
        if (item.id === id) {
          item.qty = qty;
        }
        return item;
      });
    }

    this.saveCart(cart);
    return cart;
  },

  incrementCartItem: function (id) {
    let cart = this.getCart();
    let item = cart.find(function (i) {
      return i.id === id;
    });

    let currentQty = item ? item.qty : 0;
    return this.setQty(id, currentQty + 1);
  },

  decrementCartItem: function (id) {
    let cart = this.getCart();
    let item = cart.find(function (i) {
      return i.id === id;
    });

    let currentQty = item ? item.qty : 0;
    return this.setQty(id, currentQty - 1);
  },

  removeFromCart: function (id) {
    let cart = this.getCart();
    let filteredCart = cart.filter(function (item) {
      return item.id !== id;
    });

    this.saveCart(filteredCart);
  },

  clearCart: function () {
    this.saveCart([]);
  },

  getCartCount: function () {
    let cart = this.getCart();
    let total = 0;

    for (let i = 0; i < cart.length; i++) {
      total += cart[i].qty;
    }

    return total;
  },

  getCartTotal: function (products) {
    let cart = this.getCart();
    let totalAmount = 0;

    for (let i = 0; i < cart.length; i++) {
      let item = cart[i];
      let product = products.find(function (p) {
        return p.id === item.id;
      });

      if (product) {
        totalAmount += product.price * item.qty;
      }
    }

    return totalAmount;
  },

  // ---------------- Wishlist ----------------

  getWishlist: function () {
    return readData(KEYS.wishlist, []);
  },

  isWishlisted: function (id) {
    let wishlist = this.getWishlist();
    return wishlist.includes(id);
  },

  toggleWishlist: function (id) {
    let wishlist = this.getWishlist();

    if (wishlist.includes(id)) {
      wishlist = wishlist.filter(function (wishlistId) {
        return wishlistId !== id;
      });
    } else {
      wishlist.push(id);
    }

    writeData(KEYS.wishlist, wishlist);

    let event = new CustomEvent("kiranakart:wishlist-updated", {
      detail: { wishlist: wishlist },
    });
    document.dispatchEvent(event);

    return wishlist;
  },
};
