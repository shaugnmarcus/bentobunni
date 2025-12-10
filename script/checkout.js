// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBQTG-bp6zQj7vlC7TLVLPZ-EaSBZUQkyw",
  authDomain: "bento-bunni.firebaseapp.com",
  projectId: "bento-bunni",
  storageBucket: "bento-bunni.firebasestorage.app",
  messagingSenderId: "755232442360",
  appId: "1:755232442360:web:d2f8888d0bde48e638780d",
};

// initialize firebase products
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged((user) => {
  const emailDisplay = document.getElementById("user-email-display");

  if (user) {
    if (user.email) {
      emailDisplay.textContent = user.email;
    } else if (user.isAnonymous) {
      emailDisplay.textContent = "Guest Account (No email linked)";
    }
  } else {
    emailDisplay.textContent = "Guest";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  auth.onAuthStateChanged((user) => {
    if (user) {
      if (user.isAnonymous) {
        console.log("Guest user on checkout");
        renderOrderSummary([]);
      } else {
        // Fetch the cart from Firestore
        db.collection("users")
          .doc(user.uid)
          .get()
          .then((doc) => {
            if (doc.exists) {
              const data = doc.data();
              const cart = data.cart || []; // Get cart array
              renderOrderSummary(cart);
            } else {
              console.log("No user document found");
            }
          })
          .catch((error) => {
            console.error("Error fetching cart:", error);
          });
      }
    } else {
      console.log("User not logged in");
      window.location.href = "auth.html";
    }
  });

  function renderOrderSummary(items) {
    const listContainer = document.getElementById("list-container");
    const totalElement = document.getElementById("total-amount");

    if (!listContainer || !totalElement) return;

    let runningTotal = 0;

    if (items.length === 0) {
      listContainer.innerHTML = "<p>Your cart is empty.</p>";
      totalElement.innerText = "₱0.00";
      return;
    }

    const listHTML = items
      .map((item) => {
        runningTotal += item.productPrice;

        return `
      <div class="item-row">
        <p class="item-name">
          ${item.productName.replace(/-/g, " ")} 
          <br>
          <span style="font-size: 0.85em; opacity: 0.7;">
            ${item.productVariant.replace(/-/g, " ")}
          </span>
        </p>
        <p class="item-price">₱${item.productPrice}</p>
      </div>
    `;
      })
      .join("");

    listContainer.innerHTML = listHTML;
    totalElement.innerText = `₱${runningTotal.toFixed(2)}`;
  }

  const deliveryRadio = document.getElementById("delivery-radio");
  const pickupRadio = document.getElementById("pickup-radio");
  const deliverySection = document.getElementById("delivery-section");
  const pickupSection = document.getElementById("pickup");

  if (deliveryRadio && pickupRadio && deliverySection && pickupSection) {
    deliveryRadio.addEventListener("change", function () {
      if (this.checked) {
        deliverySection.style.display = "block";
        pickupSection.style.display = "none";
        console.log(
          `type of order: ${deliveryRadio.getAttribute("data-order-type")}`
        );
      }
    });

    pickupRadio.addEventListener("change", function () {
      if (this.checked) {
        pickupSection.style.display = "block";
        deliverySection.style.display = "none";
        console.log(
          `type of order: ${pickupRadio.getAttribute("data-order-type")}`
        );
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const proofInputs = document.querySelectorAll(
    "#delivery-proof, #pickup-proof"
  );

  proofInputs.forEach((input) => {
    input.addEventListener("change", function (e) {
      const file = e.target.files[0];
      const uploadLabel = e.target.closest("label.upload-label");

      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert("File size must be less than 5MB");
          e.target.value = "";
          uploadLabel.querySelector("span").innerHTML =
            "click to upload screenshot<br />jpg, png (max 5mb)";
        } else {
          uploadLabel.querySelector("span").textContent = file.name;
        }
      }
    });
  });
});

const PHONE_REGEX = /^(09\d{2}\s\d{3}\s\d{4}|09\d{9})$/;
const FACEBOOK_REGEX = /^https?:\/\/(www\.)?facebook\.com\/.+/;
const GCASH_REGEX = /^\d{11,15}$/;

function setValid(el) {
  el.classList.add("valid");
  el.classList.remove("invalid");
}

function setInvalid(el) {
  el.classList.add("invalid");
  el.classList.remove("valid");
}

function validateInput(el, regex = null, required = false) {
  const value = el.value.trim();

  if (!required && value === "") {
    el.classList.remove("invalid", "valid");
    return true;
  }

  if (value === "" && required) {
    setInvalid(el);
    return false;
  }

  if (regex && !regex.test(value)) {
    setInvalid(el);
    return false;
  }

  setValid(el);
  return true;
}

function validateDeliveryForm() {
  const fullname = document.getElementById("delivery-fullname");
  const phone = document.getElementById("delivery-phone");
  const facebook = document.getElementById("delivery-facebook");
  const address = document.getElementById("delivery-address");
  const reference = document.getElementById("delivery-reference");
  const proof = document.getElementById("delivery-proof");

  const isFullnameValid = validateInput(fullname, null, true);
  const isPhoneValid = validateInput(phone, PHONE_REGEX, true);
  const isFacebookValid = validateInput(facebook, FACEBOOK_REGEX, true);
  const isAddressValid = validateInput(address, null, true);
  const isReferenceValid = validateInput(reference, GCASH_REGEX, true);
  const isProofValid =
    proof.files.length > 0 && proof.files[0].size <= 5 * 1024 * 1024;

  const proofLabel = document.querySelector(
    "label.upload-label[for='delivery-proof']"
  );
  if (isProofValid) {
    proofLabel.classList.add("valid");
    proofLabel.classList.remove("invalid");
    proof.classList.add("valid");
    proof.classList.remove("invalid");
  } else {
    proofLabel.classList.add("invalid");
    proofLabel.classList.remove("valid");
    proof.classList.add("invalid");
    proof.classList.remove("valid");
  }

  return (
    isFullnameValid &&
    isPhoneValid &&
    isFacebookValid &&
    isAddressValid &&
    isReferenceValid &&
    isProofValid
  );
}

function validatePickupForm() {
  const fullname = document.getElementById("pickup-fullname");
  const phone = document.getElementById("pickup-phone");
  const facebook = document.getElementById("pickup-facebook");
  const reference = document.getElementById("pickup-reference");

  const isFullnameValid = validateInput(fullname, null, true);
  const isPhoneValid = validateInput(phone, PHONE_REGEX, true);
  const isFacebookValid = validateInput(facebook, FACEBOOK_REGEX, true);

  let isReferenceValid = true;
  if (reference.value.trim() !== "") {
    isReferenceValid = validateInput(reference, GCASH_REGEX, false);
  }

  return isFullnameValid && isPhoneValid && isFacebookValid && isReferenceValid;
}

function setupDeliveryValidation() {
  const fullname = document.getElementById("delivery-fullname");
  const phone = document.getElementById("delivery-phone");
  const facebook = document.getElementById("delivery-facebook");
  const address = document.getElementById("delivery-address");
  const reference = document.getElementById("delivery-reference");
  const proof = document.getElementById("delivery-proof");

  fullname.addEventListener("input", () => validateInput(fullname, null, true));
  phone.addEventListener("input", () =>
    validateInput(phone, PHONE_REGEX, true)
  );
  facebook.addEventListener("input", () =>
    validateInput(facebook, FACEBOOK_REGEX, true)
  );
  address.addEventListener("input", () => validateInput(address, null, true));
  reference.addEventListener("input", () =>
    validateInput(reference, GCASH_REGEX, true)
  );

  proof.addEventListener("change", () => {
    const file = proof.files[0];
    const label = document.querySelector(
      "label.upload-label[for='delivery-proof']"
    );

    if (file && file.size <= 5 * 1024 * 1024) {
      label.classList.add("valid");
      label.classList.remove("invalid");
      proof.classList.add("valid");
      proof.classList.remove("invalid");
    } else {
      label.classList.add("invalid");
      label.classList.remove("valid");
      proof.classList.add("invalid");
      proof.classList.remove("valid");
    }
  });
}

function setupPickupValidation() {
  const fullname = document.getElementById("pickup-fullname");
  const phone = document.getElementById("pickup-phone");
  const facebook = document.getElementById("pickup-facebook");
  const reference = document.getElementById("pickup-reference");
  const proof = document.getElementById("pickup-proof");

  fullname.addEventListener("input", () => validateInput(fullname, null, true));
  phone.addEventListener("input", () =>
    validateInput(phone, PHONE_REGEX, true)
  );
  facebook.addEventListener("input", () =>
    validateInput(facebook, FACEBOOK_REGEX, true)
  );

  reference.addEventListener("input", () =>
    validateInput(reference, GCASH_REGEX, false)
  );

  proof.addEventListener("change", () => {
    const file = proof.files[0];
    const label = document.querySelector(
      "label.upload-label[for='pickup-proof']"
    );

    if (!file) {
      label.classList.remove("valid", "invalid");
      proof.classList.remove("valid", "invalid");
      return;
    }

    if (file.size <= 5 * 1024 * 1024) {
      label.classList.add("valid");
      label.classList.remove("invalid");
      proof.classList.add("valid");
      proof.classList.remove("invalid");
    } else {
      label.classList.add("invalid");
      label.classList.remove("valid");
      proof.classList.add("invalid");
      proof.classList.remove("valid");
    }
  });
}

setupDeliveryValidation();
setupPickupValidation();

function clearCart() {
  const user = auth.currentUser;
  if (user) {
    db.collection("users")
      .doc(user.uid)
      .update({
        cart: [],
      })

      .then(() => {
        console.log("Cart cleared successfully");
      })

      .catch((error) => {
        console.error("Error clearing cart: ", error);
      });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("confirmation-modal");
  const closeBtn = modal.querySelector(".close");
  const okBtn = document.getElementById("close-modal");
  const deliverySection = document.getElementById("delivery-section");
  const pickupSection = document.getElementById("pickup");

  const deliveryForm = deliverySection.querySelector("form");
  const pickupForm = pickupSection.querySelector("form");

  deliveryForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const user = auth.currentUser;
    const deliveryFullname = deliveryForm["delivery-fullname"].value;
    const deliveryPhone = deliveryForm["delivery-phone"].value;
    const deliveryFacebook = deliveryForm["delivery-facebook"].value;
    const deliveryAddress = deliveryForm["delivery-address"].value;
    const deliveryNotes = deliveryForm["delivery-notes"].value;
    const deliveryOrderNotes = deliveryForm["delivery-order-notes"].value;
    const deliveryReference = deliveryForm["delivery-reference"].value;
    const orderId = deliveryForm["delivery-reference"].value * 123;
    let total = 0;

    const orderIdEl = document.querySelector(".order-number");
    orderIdEl.innerHTML = ``;
    orderIdEl.innerHTML += `order: <strong>#ORD-${orderId}</strong>`;

    if (validateDeliveryForm()) {
      modal.style.display = "block";
      modal.classList.add("show");
      console.log("submitted");

      if (user.isAnonymous) {
        alert("Please log in to place an order.");
        location.href = "auth.html";
        return;
      } else {
        db.collection("users")
          .doc(user.uid)
          .get()
          .then((doc) => {
            const cart = doc.data().cart || [];

            cart.forEach((item) => {
              total += item.productPrice;
            });

            console.log("Order data prepared for delivery:");
            return cart;
          })

          .then((cart) => {
            console.log("Creating delivery order in Firestore...");
            return db.collection("invoice").add({
              orderId: orderId,
              orderType: "delivery",
              userId: user.uid,
              fullname: deliveryFullname,
              cart: cart,
              total: total,
              phone: deliveryPhone,
              facebook: deliveryFacebook,
              address: deliveryAddress,
              notes: deliveryNotes,
              orderNotes: deliveryOrderNotes,
              reference: deliveryReference,
            });
          })

          .then(() => {
            console.log("Cart cleared successfully after delivery order.");
            return db.collection("users").doc(user.uid).update({
              cart: [],
            });
          })

          .catch((error) => {
            console.error("Error fetching cart for order:", error);
          });
      }
    }
  });

  pickupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const user = auth.currentUser;
    const pickupFullname = pickupForm["pickup-fullname"].value;
    const pickupPhone = Number(pickupForm["pickup-phone"].value.trim());
    const pickupFacebook = pickupForm["pickup-facebook"].value;
    const pickupOrderNotes = pickupForm["pickup-order-notes"].value;
    const pickupReference = pickupForm["pickup-reference"].value;
    const orderId = Math.floor(Math.random() * 90000000) + 10000000;
    const orderIdEl = document.querySelector(".order-number");
    orderIdEl.innerHTML = ``;
    orderIdEl.innerHTML += `order: <strong>#ORD-${orderId}</strong>`;
    let total = 0;

    if (validatePickupForm()) {
      modal.style.display = "block";
      modal.classList.add("show");
      console.log("submitted");

      if (user.isAnonymous) {
        alert("Please log in to place an order.");
        location.href = "auth.html";
        return;
      } else {
        db.collection("users")
          .doc(user.uid)
          .get()
          .then((doc) => {
            const cart = doc.data().cart || [];

            cart.forEach((item) => {
              total += item.productPrice;
            });
            console.log("Order data prepared for pickup:");
            return cart;
          })

          .then((cart) => {
            console.log("Creating pickup order in Firestore...");
            return db.collection("invoice").add({
              orderType: "pickup",
              orderId: orderId,
              userId: user.uid,
              fullname: pickupFullname,
              cart: cart,
              total: total,
              phone: pickupPhone,
              facebook: pickupFacebook,
              orderNotes: pickupOrderNotes,
              reference: pickupReference,
            });
          })

          .then(() => {
            console.log("Cart cleared successfully after pickup order.");
            return db.collection("users").doc(user.uid).update({
              cart: [],
            });
          })

          .catch((error) => {
            console.error("Error fetching cart for order:", error);
          });
      }
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });
  }

  okBtn.addEventListener("click", function () {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
      window.location.href = "index.html";
    }, 400);
  });

  window.addEventListener("click", function (e) {
    if (e.target == modal) {
      modal.classList.remove("show");
      setTimeout(() => {
        modal.style.display = "none";
      }, 400);
    }
  });
});
