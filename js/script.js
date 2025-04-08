document.addEventListener("DOMContentLoaded", function() {
    // -------------------------------------------------
    // Registration Form Submission via AJAX
    // -------------------------------------------------
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission
  
        // Basic client-side validation for password match
        const password = document.getElementById("reg-password").value;
        const confirmPassword = document.getElementById("reg-confirm-password").value;
        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        }
  
        // Create form data to send
        const formData = new FormData(registerForm);
  
        // Send data to the backend registration PHP script
        fetch("register (1).php", {
          method: "POST",
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Store the user's role and email for front-end simulation
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("userEmail", data.email);
            // Redirect to dashboard
            window.location.href = "dashboard.html";
          } else {
            alert("Registration failed: " + data.error);
          }
        })
        .catch(error => {
          console.error("Error during registration:", error);
          alert("Registration error, please try again.");
        });
      });
    }
  
    // -------------------------------------------------
    // Login Form Submission via AJAX
    // -------------------------------------------------
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission
  
        // Create form data to send
        const formData = new FormData(loginForm);
  
        // Send data to the backend login PHP script
        fetch("login (1).php", {
          method: "POST",
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Store the user's role and email for front-end simulation
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("userEmail", data.email);
            // Redirect to dashboard
            window.location.href = "dashboard.html";
          } else {
            alert("Login failed: " + data.error);
          }
        })
        .catch(error => {
          console.error("Error during login:", error);
          alert("Login error, please try again.");
        });
      });
    }
  
    // -------------------------------------------------
    // Display Role-Based Sections on Dashboard
    // -------------------------------------------------
    if (window.location.pathname.includes("dashboard.html")) {
      const userRole = localStorage.getItem("userRole");
  
      const studentSection = document.getElementById("student-section");
      const adminSection = document.getElementById("admin-section");
      const superAdminSection = document.getElementById("superadmin-section");
  
      if (userRole === "student" && studentSection) {
        studentSection.style.display = "block";
      }
      if (userRole === "admin" && adminSection) {
        adminSection.style.display = "block";
      }
      if (userRole === "superadmin" && superAdminSection) {
        superAdminSection.style.display = "block";
      }
    }
  
    // -------------------------------------------------
    // Dynamic Event Loading using the fetchEvents API
    // -------------------------------------------------
    const eventsList = document.getElementById("events-list");
    if (eventsList) {
    // Call your fetchEvents API endpoint
    fetch("fetchEvents.php")
        .then(response => response.json())
        .then(data => {
        if (data.success) {
            // Assume data.events is an array of event objects
            data.events.forEach(event => {
            // Create a new div for each event card
            const eventCard = document.createElement("div");
            eventCard.classList.add("event-card");

            // Populate the event card with event details
            eventCard.innerHTML = `
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Time:</strong> ${event.time}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Description:</strong> ${event.description}</p>
            `;

            // Append the event card to the events list
            eventsList.appendChild(eventCard);

            // Add click event listener to open modal on card click
            eventCard.addEventListener("click", function() {
                const modal = document.getElementById("modal");
                const modalBody = document.getElementById("modal-body");
                modalBody.innerHTML = eventCard.innerHTML;
                modal.style.display = "block";
            });
            });
        } else {
            eventsList.innerHTML = "<p>No events found.</p>";
        }
        })
        .catch(error => {
        console.error("Error fetching events:", error);
        eventsList.innerHTML = "<p>Error loading events. Please try again later.</p>";
        });
    }

    // -------------------------------------------------
    // Modal Close Functionality
    // -------------------------------------------------
    const closeButton = document.querySelector(".close-button");
    if (closeButton) {
      closeButton.addEventListener("click", function() {
        document.getElementById("modal").style.display = "none";
      });
    }
    
    window.addEventListener("click", function(event) {
      const modal = document.getElementById("modal");
      if (modal && event.target === modal) {
        modal.style.display = "none";
      }
    });
  });
  