document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("auth-form");

  if (!form) {
    return;
  }

  const mode = form.dataset.mode;
  const message = document.getElementById("auth-message");
  const submit = form.querySelector('button[type="submit"]');

  function showMessage(text, type) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.className = type;
  }

  function readUser() {
    try {
      return JSON.parse(localStorage.getItem("smartPaintUser") || "null");
    } catch (error) {
      console.warn("Unable to read the saved demo account.", error);
      return null;
    }
  }

  function saveUser(user) {
    localStorage.setItem("smartPaintUser", JSON.stringify(user));
    sessionStorage.setItem("smartPaintAuth", "true");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const email =
      form.querySelector("#email")?.value.trim().toLowerCase() || "";
    const password = form.querySelector("#password")?.value || "";
    const name = form.querySelector("#name")?.value.trim() || "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage("Enter a valid email address.", "form-error");
      return;
    }

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters.", "form-error");
      return;
    }

    try {
      if (mode === "register") {
        if (name.length < 2) {
          showMessage("Please enter your name.", "form-error");
          return;
        }

        const existingUser = readUser();

        if (existingUser?.email === email) {
          showMessage(
            "An account with this email already exists. Please sign in.",
            "form-error",
          );
          return;
        }

        const user = {
          name,
          email,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem("smartPaintUser", JSON.stringify(user));
        saveUser(user);
        showMessage(
          "Account created. Opening your workspace...",
          "form-success",
        );
      } else {
        const savedUser = readUser();

        if (!savedUser || savedUser.email !== email) {
          showMessage(
            "No account was found for this email. Please create an account first.",
            "form-error",
          );
          return;
        }

        saveUser(savedUser);
        showMessage("Signed in. Opening your workspace...", "form-success");
      }

      if (submit) {
        submit.disabled = true;
      }

      window.setTimeout(() => {
        window.location.href = "upload.html";
      }, 450);
    } catch (error) {
      console.error("Authentication error:", error);
      showMessage(
        "Your browser storage is unavailable. Please enable site storage and try again.",
        "form-error",
      );
    }
  });
});
