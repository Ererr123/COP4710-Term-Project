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
  
        // Send data to the backend registration PHP script (inside the 'api' folder)
        fetch("api/register.php", {
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
  
        // Send data to the backend login PHP script (inside the 'api' folder)
        fetch("api/login.php", {
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
    // Dynamic Event Loading using fetchEvents API
    // -------------------------------------------------
    const eventsList = document.getElementById("events-list");
    if (eventsList) {
      // Call the API to fetch events (using the "Public" ISA_type; change as needed)
      fetch("api/fetchEvents.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ISA_type: "Public" })
      })
      .then(response => response.json())
      .then(data => {
        console.log("fetchEvents response:", data); // For debugging
        if (data.success) {
          // Loop through each event returned
          data.events.forEach(event => {
            const eventCard = document.createElement("div");
            eventCard.classList.add("event-card");
  
            eventCard.innerHTML = `
              <h3>${event.name}</h3>
              <p><strong>Category:</strong> ${event.event_category}</p>
              <p><strong>Date:</strong> ${event.event_date}</p>
              <p><strong>Time:</strong> ${event.event_time}</p>
              <p><strong>Location:</strong> ${event.location_ID}</p>
              <p><strong>Description:</strong> ${event.description}</p>
            `;
  
            eventsList.appendChild(eventCard);
  
            // Add click event listener to open modal with event details and comments
            eventCard.addEventListener("click", function() {
              const modal = document.getElementById("modal");
              const modalBody = document.getElementById("modal-body");
  
              // Display event details
              modalBody.innerHTML = eventCard.innerHTML;
  
              // Create a container for comments
              const commentsContainer = document.createElement("div");
              commentsContainer.id = "comments-container";
              commentsContainer.innerHTML = "<h4>Comments</h4><div id='comments-list'></div>";
              modalBody.appendChild(commentsContainer);
  
              // Get the event ID from the event object (adjust property name if needed)
              const eventID = event.event_ID;
  
              // Fetch comments for this event from the backend (inside the 'api' folder)
              fetch("api/fetchComments.php", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ event_ID: eventID })
              })
              .then(response => response.json())
              .then(commentData => {
                const commentsList = document.getElementById("comments-list");
                if (commentData.success && commentData.comments.length > 0) {
                  commentData.comments.forEach(comment => {
                    const commentItem = document.createElement("p");
                    // Adjust these keys based on your API (e.g., comment.author, comment.text)
                    commentItem.innerHTML = `<strong>${comment.author}</strong>: ${comment.text}`;
                    commentsList.appendChild(commentItem);
                  });
                } else {
                  commentsList.innerHTML = "<p>No comments for this event.</p>";
                }
              })
              .catch(error => {
                console.error("Error fetching comments:", error);
                const commentsList = document.getElementById("comments-list");
                commentsList.innerHTML = "<p>Error loading comments.</p>";
              });
              
              // Open the modal
              modal.style.display = "block";
            });
          });
        } else {
          eventsList.innerHTML = `<p>${data.error || "No events found."}</p>`;
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
    const modal = document.getElementById("modal");
    const closeButton = document.querySelector(".close-button");
  
    if (modal && closeButton) {
      closeButton.addEventListener("click", function() {
        modal.style.display = "none";
      });
    }
  
    window.addEventListener("click", function(event) {
      if (modal && event.target === modal) {
        modal.style.display = "none";
      }
    });
  });
  