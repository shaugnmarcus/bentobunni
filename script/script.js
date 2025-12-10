const firebaseConfig = {
  apiKey: "AIzaSyBQTG-bp6zQj7vlC7TLVLPZ-EaSBZUQkyw",
  authDomain: "bento-bunni.firebaseapp.com",
  projectId: "bento-bunni",
  storageBucket: "bento-bunni.firebasestorage.app",
  messagingSenderId: "755232442360",
  appId: "1:755232442360:web:d2f8888d0bde48e638780d",
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const profileIcon = document.getElementById("profile");
const profilePanel = document.getElementById("profile-panel");
const profileOverlay = document.getElementById("profile-overlay");
const closeProfileButton = document.getElementById("close-profile");
const sidebarAuthButton = document.getElementById("sidebar-auth-button");
const sidebarUsername = document.getElementById("sidebar-username");
const profileMainText = document.getElementById("profile-main-text");
const profileSubText = document.getElementById("profile-sub-text");

let currentUserState = "guest";

function openProfile() {
  profilePanel.classList.add("open");
  profileOverlay.classList.add("active");
}

function closeProfile() {
  profilePanel.classList.remove("open");
  profileOverlay.classList.remove("active");
}

profileIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  openProfile();
});
closeProfileButton.addEventListener("click", closeProfile);
profileOverlay.addEventListener("click", closeProfile);

sidebarAuthButton.addEventListener("click", () => {
  if (currentUserState === "guest") {
    window.location.href = "auth.html";
  } else {
    auth.signOut().then(() => {
      console.log("User signed out");
      closeProfile();
      window.location.reload();
    });
  }
});

auth.onAuthStateChanged(function (user) {
  if (!user) {
    auth.signInAnonymously().catch((error) => console.error(error));
  } else {
    if (user.isAnonymous) {
      currentUserState = "guest";

      if (sidebarUsername) sidebarUsername.textContent = "Guest";
      if (profileMainText) profileMainText.textContent = "access your account";
      if (profileSubText)
        profileSubText.textContent = "sign in to start your next order";
      if (sidebarAuthButton) sidebarAuthButton.textContent = "login";

      updateCartCount(0);
    } else {
      currentUserState = "user";

      db.collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          const data = doc.data();
          const username = data.username || "User";
          const cartLength = data.cart ? data.cart.length : 0;

          if (sidebarUsername) sidebarUsername.textContent = username;
          if (profileMainText) profileMainText.textContent = "welcome!";
          if (profileSubText)
            profileSubText.textContent =
              "you’re logged in, time to treat yourself";
          if (sidebarAuthButton) sidebarAuthButton.textContent = "logout";

          updateCartCount(cartLength);
        });
    }
  }
});

document.querySelectorAll(".accordion-header").forEach((button) => {
  button.addEventListener("click", () => {
    const content = button.nextElementSibling;

    if (content.style.maxHeight) {
      content.style.maxHeight = null;
      button.classList.remove("active");
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      button.classList.add("active");
    }
  });
});

const nav = document.querySelector("nav");
let lastScrollY = window.scrollY;

nav.style.transition = "transform 0.3s ease-in-out";

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > 0) {
    nav.style.transform = "translateY(-100%)";
  } else {
    nav.style.transform = "translateY(0)";
  }

  lastScrollY = currentScrollY;
});

// --- BACKEND FOR CART BADGE ---
function updateCartCount(count) {
  const badge = document.getElementById("cart-count");

  if (count >= 0) {
    badge.style.display = "flex"; // show badge
    badge.innerText = count;

    if (count > 99) {
      badge.innerText = "99+";
    }
  } else {
    badge.style.display = "none"; // hide if 0
  }
}

auth.onAuthStateChanged(function (user) {
  if (!user) {
    auth.signInAnonymously().catch(function (error) {
      console.error("Error during anonymous sign-in:", error);
    });
  } else {
    if (user.isAnonymous) {
      updateCartCount(0);
    } else {
      db.collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          const data = doc.data();
          const cartLength = data && data.cart ? data.cart.length : 0;
          updateCartCount(cartLength);
        })
        .catch((error) => {
          console.error("Error fetching cart:", error);
          updateCartCount(0);
        });
    }
  }
});

const checkoutButton = document.getElementById("checkout-button");

if (checkoutButton) {
  checkoutButton.addEventListener("click", () => {
    const user = auth.currentUser;

    if (!user) {
      console.log("User not loaded");
      return;
    }

    window.location.href = "checkout.html";
  });
}

const allButton = document.getElementById("all");
const browniesButton = document.getElementById("brownies");
const bananaBreadButton = document.getElementById("banana-bread");
const crinklesButton = document.getElementById("crinkles");

const bananaBreadSection = document.getElementById("banana-bread-section");
const browniesSection = document.getElementById("brownies-section");
const crinklesSection = document.getElementById("crinkles-section");

if (allButton) {
  allButton.addEventListener("click", () => {
    bananaBreadSection.style.display = "flex";
    browniesSection.style.display = "flex";
    crinklesSection.style.display = "flex";
  });
}

if (bananaBreadButton) {
  bananaBreadButton.addEventListener("click", () => {
    bananaBreadSection.style.display = "flex";
    browniesSection.style.display = "none";
    crinklesSection.style.display = "none";
  });
}

if (browniesButton) {
  browniesButton.addEventListener("click", () => {
    bananaBreadSection.style.display = "none";
    browniesSection.style.display = "flex";
    crinklesSection.style.display = "none";
  });
}

if (crinklesButton) {
  crinklesButton.addEventListener("click", () => {
    bananaBreadSection.style.display = "none";
    browniesSection.style.display = "none";
    crinklesSection.style.display = "flex";
  });
}

const addtocartButtons = document.querySelectorAll(".add-to-cart");

function addToCart(productId, variant) {
  const user = auth.currentUser;

  db.collection("products")
    .doc(productId)
    .get()
    .then((doc) => {
      const productName = doc.data().name;
      const productPrice = doc.data().variants[variant];

      console.log(`${productName} ${variant} - ${productPrice}`);

      return db
        .collection("users")
        .doc(user.uid)
        .get()
        .then((userDoc) => {
          const cart = userDoc.data().cart || [];
          cart.push({
            productId: productId,
            productName: productName,
            productVariant: variant,
            productPrice: productPrice,
          });

          updateCartCount(cart.length);
          console.log(cart.length);
          showToast(`${productName} added to cart!`);

          return db.collection("users").doc(user.uid).update({ cart });
        });
    });
}

addtocartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    console.log("clicked");
    const productId = button.getAttribute("data-product-id");
    const variant = button.getAttribute("data-variants");
    const user = auth.currentUser;

    if (!user) {
      console.log("User not loaded yet");
      return;
    }

    if (user.isAnonymous) {
      window.location.href = "auth.html";
    } else {
      addToCart(productId, variant);
    }
  });
});

const cartIcon = document.getElementById("cart-icon");

function updateLocalTotal(deductedAmount) {
  const totalElement = document.getElementById("total-amount");
  let currentTotal = parseFloat(
    totalElement.textContent.replace(/[^0-9.]/g, "")
  );
  let newTotal = currentTotal - deductedAmount;

  if (newTotal < 0) newTotal = 0;

  totalElement.textContent = `₱ ${newTotal.toFixed(2)}`;
}

function renderCart() {
  const user = auth.currentUser;
  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = "";

  db.collection("users")
    .doc(user.uid)
    .get()
    .then((doc) => {
      const cart = doc.data().cart || [];
      let total = 0;

      let cartHtml = "";

      cart.forEach((item) => {
        total += item.productPrice;

        cartHtml += `
<div class="cart-item">
<div class="item-title">
<h1>${item.productName.replace(/-/g, " ")}</h1>
<h2>${item.productVariant.replace(/-/g, " ")}</h2>
</div>
<div class="item-actions">
<p class="item-price">₱${item.productPrice}</p>
<button class="remove-item"
data-product-id="${item.productId}"
data-variant="${item.productVariant}">
remove
</button>
</div>
</div>
`;
      });

      // Inject HTML once
      cartItemsContainer.innerHTML = cartHtml;

      console.log(`Total: ₱${total}`);
      document.getElementById("total-amount").textContent = `₱ ${total.toFixed(
        2
      )}`;

      // Re-attach event listeners
      document.querySelectorAll(".remove-item").forEach((button) => {
        button.addEventListener("click", (e) => {
          const itemCard = button.closest(".cart-item");
          const productId = button.getAttribute("data-product-id");
          const variant = button.getAttribute("data-variant");

          // Get price from the HTML to update total instantly
          const priceString = itemCard.querySelector(".item-price").textContent;
          const price = parseFloat(priceString.replace(/[^0-9.]/g, ""));

          itemCard.classList.add("removing");

          setTimeout(() => {
            // Remove from screen immediately
            itemCard.remove();

            // Update the total number on screen immediately
            updateLocalTotal(price);

            // Update Firebase silently (Backend
            removeFromCart(productId, variant);
          }, 400);
        });
      });
    });
}

function removeFromCart(productId, variant) {
  const user = auth.currentUser;
  db.collection("users")
    .doc(user.uid)
    .get()
    .then((doc) => {
      let cart = doc.data().cart || [];
      const itemIndex = cart.findIndex(
        (item) =>
          item.productId === productId && item.productVariant === variant
      );
      if (itemIndex !== -1) {
        cart.splice(itemIndex, 1);
      }
      // Update DB and update the badge count
      db.collection("users")
        .doc(user.uid)
        .update({ cart })
        .then(() => {
          console.log("Item removed from DB");
          updateCartCount(cart.length);
        });
    });
}

const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartButton = document.getElementById("close-cart");

// Open cart when clicking cart icon
cartIcon.addEventListener("click", () => {
  const user = auth.currentUser;

  if (!user) {
    console.log("User not loaded yet");
    return;
  }

  if (user.isAnonymous) {
    window.location.href = "auth.html";
  } else {
    cartPanel.classList.add("open");
    cartOverlay.classList.add("active");
    renderCart(); // Render cart items
  }
});

// Close cart when clicking close button
closeCartButton.addEventListener("click", () => {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("active");
});

// Close cart when clicking overlay
cartOverlay.addEventListener("click", () => {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("active");
});

let toastTimeout;

function showToast(message) {
  const toast = document.getElementById("toast-notification");

  toast.innerText = message;

  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
