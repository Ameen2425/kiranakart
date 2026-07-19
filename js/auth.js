function showError(el, message) {
  el.textContent = message;
  el.style.display = "block";
}

function hideError(el) {
  el.style.display = "none";
}

function handleSignup(event) {
  // Prevent the default form submission behavior so the page doesn't reload
  event.preventDefault();

  let errorEl = document.getElementById("signup-error");
  hideError(errorEl);

  let name = document.getElementById("signup-name").value.trim();
  let email = document.getElementById("signup-email").value.trim();
  let phone = document.getElementById("signup-phone").value.trim();
  let password = document.getElementById("signup-password").value;
  let confirm = document.getElementById("signup-confirm").value;
  let termsAccepted = document.getElementById("signup-terms").checked;

  if (!name || !email || !phone || !password || !confirm) {
    showError(errorEl, "Please fill in every field.");
    return;
  }

  // We use Regular Expressions (Regex) to ensure the user provides valid inputs
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9]{9,14}$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/;

  if (!nameRegex.test(name)) {
    showError(errorEl, "Name should only contain letters and spaces (2 to 50 characters).");
    return;
  }

  if (!emailRegex.test(email)) {
    showError(errorEl, "Please enter a valid email address.");
    return;
  }

  if (!phoneRegex.test(phone)) {
    showError(errorEl, "Please enter a valid phone number (9 to 14 digits).");
    return;
  }

  if (!passwordRegex.test(password)) {
    showError(errorEl, "Password must be 8 to 16 characters long and contain at least one uppercase letter, one lowercase letter, and one number.");
    return;
  }

  if (password !== confirm) {
    showError(errorEl, "Passwords do not match.");
    return;
  }

  if (!termsAccepted) {
    showError(errorEl, "Please accept the Terms of Service to continue.");
    return;
  }

  try {
    // Create the user object and save it to the browser's local storage
    let user = {
      name: name,
      email: email,
      phone: phone,
      password: password,
    };
    KiranaKartStorage.saveUser(user);
  } catch (err) {
    showError(errorEl, err.message);
    return;
  }

  window.location.href = `login.html?justRegistered=1&email=${encodeURIComponent(email)}`;
}

let signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", handleSignup);
}

function handleLogin(event) {
  // Prevent the default form submission behavior so the page doesn't reload
  event.preventDefault();

  let errorEl = document.getElementById("login-error");
  errorEl.style.background = "var(--color-danger-light)";
  errorEl.style.color = "var(--color-danger)";
  hideError(errorEl);

  let email = document.getElementById("login-email").value.trim();
  let password = document.getElementById("login-password").value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/;

  if (!emailRegex.test(email)) {
    showError(errorEl, "Please enter a valid email address.");
    return;
  }

  if (!passwordRegex.test(password)) {
    showError(errorEl, "Password must be 8 to 16 characters long and contain at least one uppercase letter, one lowercase letter, and one number.");
    return;
  }

  let user = KiranaKartStorage.validateLogin(email, password);

  if (!user) {
    showError(
      errorEl,
      "Incorrect email or password. Please try again, or sign up first.",
    );
    return;
  }

  KiranaKartStorage.setCurrentUser(user.email);
  window.location.href = "index.html";
}

function checkRegistrationStatus() {
  let params = new URLSearchParams(window.location.search);
  let justRegistered = params.get("justRegistered");
  let emailParam = params.get("email");

  if (justRegistered === "1") {
    let errorEl = document.getElementById("login-error");
    errorEl.style.background = "var(--color-success-light)";
    errorEl.style.color = "var(--color-success)";
    showError(
      errorEl,
      "Account created! Log in with your new credentials to continue.",
    );

    let emailInput = document.getElementById("login-email");
    if (emailInput && emailParam) {
      emailInput.value = emailParam;
    }
  }
}

let loginForm = document.getElementById("login-form");
if (loginForm) {
  checkRegistrationStatus();
  loginForm.addEventListener("submit", handleLogin);
}
