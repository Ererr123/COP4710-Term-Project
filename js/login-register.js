document.addEventListener("DOMContentLoaded", function () {
    const registerButton = document.getElementById("register-button");
    const loginButton = document.getElementById("login-button");
  
    // Create or grab message boxes for feedback
    let messageBox = document.getElementById("message-box");
    let messageBoxLogin = document.getElementById("message-box-login");
    if (!messageBox) {
      messageBox = document.createElement("div");
      messageBox.id = "message-box";
      document.body.appendChild(messageBox);
    }
    if (!messageBoxLogin) {
      messageBoxLogin = document.createElement("div");
      messageBoxLogin.id = "message-box-login";
      document.body.appendChild(messageBoxLogin);
    }
  
    // -------------------------------------------------
    // Registration Event Listener
    // -------------------------------------------------
    registerButton.addEventListener("click", function (event) {
      event.preventDefault();
  
      const usernameInput = document.getElementById("reg-username");
      const passwordInput = document.getElementById("reg-password");
      const nameInput = document.getElementById("reg-name");
      const universityInput = document.getElementById("reg-university-ID");
      const roleInput = document.getElementById("reg-role");
  
      const username = usernameInput.value.trim();
      const password = passwordInput.value;
      const name = nameInput.value.trim();
      const universityID = parseInt(universityInput.value);
      // Normalize the role to lower-case for consistent comparison
      const role = roleInput.value.trim().toLowerCase();
  
      if (!role) {
        messageBox.textContent = "⚠️ Please select a role.";
        messageBox.style.color = "orange";
        return;
      }
  
      const data = {
        username: username,
        password: password,
        name: name,
        role: role,
        university_ID: universityID
      };
  
      fetch("api/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Server responded with an error");
          }
          return response.json();
        })
        .then(result => {
          // Clear inputs on successful registration
          usernameInput.value = "";
          passwordInput.value = "";
          nameInput.value = "";
          universityInput.value = "";
          roleInput.value = "";
    
          messageBox.textContent = "✅ Registration successful!";
          messageBox.style.color = "green";
        })
        .catch(error => {
          console.error("Registration failed:", error);
          messageBox.textContent = "❌ Registration failed. Please try again.";
          messageBox.style.color = "red";
        });
    });
  
    // -------------------------------------------------
    // Login Event Listener
    // -------------------------------------------------
    loginButton.addEventListener("click", function (event) {
      event.preventDefault();
  
      const usernameInput = document.getElementById("login-username");
      const passwordInput = document.getElementById("login-password");
  
      const data = {
        username: usernameInput.value.trim(),
        password: passwordInput.value
      };
  
      fetch("api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(res => {
          if (!res.ok) throw new Error("Login failed");
          return res.json();
        })
        .then(result => {
          console.log("Login result:", result); // Debug the login response
  
          if (result) {
            const { id, username, name, user_type, university_ID } = result;
            // Normalize user_type to lower-case
            const normalizedUserType = user_type.trim().toLowerCase();
            const userInfo = { id, username, name, user_type: normalizedUserType, university_ID };
            
            localStorage.setItem("user", JSON.stringify(userInfo));
            localStorage.setItem("userRole", normalizedUserType);
  
            messageBoxLogin.textContent = "✅ Login successful!";
            messageBoxLogin.style.color = "green";
            
            setTimeout(() => {
              // Redirect to dashboard if admin or superadmin, otherwise to events page.
              if (normalizedUserType === "admin" || normalizedUserType === "superadmin") {
                window.location.href = "dashboard.html";
              } else {
                window.location.href = "events.html";
              }
            }, 1000);
          } else {
            messageBoxLogin.textContent = "❌ Invalid credentials.";
            messageBoxLogin.style.color = "red";
          }
        })
        .catch(err => {
          console.error("Login error:", err);
          messageBoxLogin.textContent = "❌ Login failed. Please try again.";
          messageBoxLogin.style.color = "red";
        });
    });
  });
  