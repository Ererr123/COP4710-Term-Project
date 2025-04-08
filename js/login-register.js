document.addEventListener("DOMContentLoaded", function () {

    const registerButton = document.getElementById("register-button");
    const loginButton = document.getElementById("login-button");

    // Create or grab a place to show messages
    let messageBox = document.getElementById("message-box");
    let messageBoxLogin = document.getElementById("message-box-login");
    if (!messageBox) {
        messageBox = document.createElement("div");
        messageBox.id = "message-box";
        document.body.appendChild(messageBox);
    }

    registerButton.addEventListener("click", function (event) {
        event.preventDefault();

        const usernameInput = document.getElementById("reg-username");
        const passwordInput = document.getElementById("reg-password");
        const nameInput = document.getElementById("reg-name");
        const universityInput = document.getElementById("reg-university-ID");
        const roleInput = document.getElementById("reg-role");

        const username = usernameInput.value;
        const password = passwordInput.value;
        const name = nameInput.value;
        const universityID = parseInt(universityInput.value);
        const role = roleInput.value;

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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Server responded with an error");
            }
            return response.json();
        })
        .then(result => {
            // On success, clear inputs
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

    loginButton.addEventListener("click", function (event) {
        event.preventDefault();

        const usernameInput = document.getElementById("login-username");
        const passwordInput = document.getElementById("login-password");

        const data = {
            username: usernameInput.value,
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
            if (result) {
                const { id, username, name, user_type, university_ID } = result;
                const userInfo = { id, username, name, user_type, university_ID };
                localStorage.setItem("user", JSON.stringify(userInfo));

                messageBoxLogin.textContent = "✅ Login successful!";
                messageBoxLogin.style.color = "green";
                
                setTimeout(() => {
                    window.location.href = "events.html";
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
