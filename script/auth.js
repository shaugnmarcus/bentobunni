// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBQTG-bp6zQj7vlC7TLVLPZ-EaSBZUQkyw",
  authDomain: "bento-bunni.firebaseapp.com",
  projectId: "bento-bunni",
  storageBucket: "bento-bunni.firebasestorage.app",
  messagingSenderId: "755232442360",
  appId: "1:755232442360:web:d2f8888d0bde48e638780d",
};

// connect our website to firebase
const app = firebase.initializeApp(firebaseConfig);

// initialize firebase products
const auth = firebase.auth();
const db = firebase.firestore();

const signup = document.getElementById("sign-up");
const login = document.getElementById("login");

// regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^.{6,}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

const showError = (inputElement, message) => {
  inputElement.style.border = "2px solid #ff4d4d";
  inputElement.style.outline = "none";
  alert(message);
  inputElement.focus();
};

const resetStyles = (formElement) => {
  const inputs = formElement.querySelectorAll("input");
  inputs.forEach((input) => {
    input.style.border = "";
    input.style.outline = "";
  });
};

login.addEventListener("submit", (e) => {
  e.preventDefault();
  resetStyles(login);

  // email and password element
  const emailInput = login["email-login"];
  const passwordInput = login["password-login"];

  // value from inputs
  const email = emailInput.value;
  const password = passwordInput.value;

  // validating email
  if (!emailRegex.test(email)) {
    return showError(emailInput, "Please enter a valid email address.");
  }

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("User logged in:", userCredential.user);
      window.location.href = "./home.html";
    })
    .catch((error) => {
      alert(error.message);
      login.reset();
    });
});

signup.addEventListener("submit", (e) => {
  e.preventDefault();
  resetStyles(signup);

  const usernameInput = signup["username-signup"];
  const emailInput = signup["email-signup"];
  const passwordInput = signup["password-signup"];
  const confirmInput = signup["confirm-password"];

  const username = usernameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  if (!usernameRegex.test(username)) {
    return showError(
      usernameInput,
      "Username must be 3-20 characters long and contain only letters, numbers, or underscores."
    );
  }

  if (!emailRegex.test(email)) {
    return showError(emailInput, "Please enter a valid email address.");
  }

  if (!passwordRegex.test(password)) {
    return showError(
      passwordInput,
      "Password must be at least 6 characters long."
    );
  }

  if (password !== confirmPassword) {
    passwordInput.style.border = "2px solid #ff4d4d";
    return showError(confirmInput, "Passwords do not match.");
  }
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("User signed up:", userCredential.user);
      return db.collection("users").doc(userCredential.user.uid).set({
        username: username,
        email: email,
        cart: [],
      });
    })
    .then(() => {
      window.location.href = "./home.html";
    })
    .catch((error) => {
      alert(error.message);
      signup.reset();
    });
});
