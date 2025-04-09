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
          // Redirect based on role
          if (data.role === "admin" || data.role === "superadmin") {
            window.location.href = "dashboard.html";
          } else {
            window.location.href = "events.html";
          }
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
          // Also store complete user info if provided
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
          // Redirect based on role
          if (data.role === "admin" || data.role === "superadmin") {
            window.location.href = "dashboard.html";
          } else {
            window.location.href = "events.html";
          }
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
    console.log("Dashboard loaded. userRole =", userRole);

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

          // Add click event listener to open modal with event details, comments, and a comment form
          eventCard.addEventListener("click", function() {
            const modal = document.getElementById("modal");
            const modalBody = document.getElementById("modal-body");

            // Clear previous modal content
            modalBody.innerHTML = "";

            // Display event details in the modal
            const eventDetails = document.createElement("div");
            eventDetails.innerHTML = eventCard.innerHTML;
            modalBody.appendChild(eventDetails);

            // Container for comments
            const commentsContainer = document.createElement("div");
            commentsContainer.id = "comments-container";
            commentsContainer.innerHTML = "<h4>Comments</h4><div id='comments-list'><p>No comments for this event.</p></div>";
            modalBody.appendChild(commentsContainer);

            // Get the event's unique ID; ensure the event object includes event_ID
            const eventID = event.event_ID;

            // Function to load comments for the current event
            function loadComments() {
              fetch("api/fetchComments.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event_ID: eventID })
              })
              .then(response => response.json())
              .then(commentData => {
                const commentsList = document.getElementById("comments-list");
                // If comments exist, build list; otherwise, show default message
                if (commentData.success && commentData.comments.length > 0) {
                  // Clear previous content
                  commentsList.innerHTML = "";
                  commentData.comments.forEach(comment => {
                    const commentItem = document.createElement("div");
                    commentItem.classList.add("comment-item");
                    // Use 'author' returned from join; fallback to user_ID if undefined
                    commentItem.innerHTML = `<p><strong>${comment.author || "User #" + comment.user_ID}</strong>: ${comment.text} (Rating: ${comment.rating})</p>`;
                    // Create a delete button for each comment
                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "Delete";
                    deleteBtn.classList.add("delete-comment-btn");
                    deleteBtn.addEventListener("click", function() {
                      if (confirm("Are you sure you want to delete this comment?")) {
                        fetch("api/deleteComment.php", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ comment_ID: comment.comment_ID })
                        })
                        .then(response => response.json())
                        .then(deleteResult => {
                          console.log("Delete result:", deleteResult);
                          if (deleteResult.success) {
                            commentItem.remove();
                          } else {
                            alert("Error deleting comment: " + deleteResult.error);
                          }
                        })
                        .catch(err => {
                          console.error("Error deleting comment:", err);
                        });
                      }
                    });
                    commentItem.appendChild(deleteBtn);
                    commentsList.appendChild(commentItem);
                  });
                } else {
                  commentsList.innerHTML = "<p>No comments for this event.</p>";
                }
              })
              .catch(error => {
                console.error("Error fetching comments:", error);
                document.getElementById("comments-list").innerHTML = "<p>Error loading comments.</p>";
              });
            }

            // Initially load comments
            loadComments();

            // --- Add Comment Form ---
            const commentFormContainer = document.createElement("div");
            commentFormContainer.id = "comment-form-container";
            commentFormContainer.innerHTML = `
              <h4>Add a Comment</h4>
              <form id="comment-form">
                <label for="comment-text">Comment:</label>
                <textarea id="comment-text" name="text" required></textarea>
                <label for="comment-rating">Rating (1-5):</label>
                <input type="number" id="comment-rating" name="rating" min="1" max="5" required>
                <button type="submit">Submit Comment</button>
              </form>
              <div id="comment-result"></div>
            `;
            modalBody.appendChild(commentFormContainer);

            // Listen for comment form submission
            const commentForm = document.getElementById("comment-form");
            commentForm.addEventListener("submit", function(e) {
              e.preventDefault();

              const commentText = document.getElementById("comment-text").value;
              const commentRating = document.getElementById("comment-rating").value;

              // Retrieve the logged-in user's ID from localStorage
              let userID = null;
              const userDataStr = localStorage.getItem("user");
              if (userDataStr) {
                try {
                  const userData = JSON.parse(userDataStr);
                  userID = userData.id;
                } catch (err) {
                  console.error("Error parsing user data:", err);
                }
              }

              const commentObj = {
                event_ID: eventID,
                user_ID: userID,
                text: commentText,
                rating: commentRating
              };

              // Send the new comment to createComment.php
              fetch("api/createComment.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(commentObj)
              })
              .then(response => response.json())
              .then(commentResult => {
                const commentResultDiv = document.getElementById("comment-result");
                if (commentResult.success) {
                  commentResultDiv.innerHTML = "<p>Comment added successfully!</p>";
                  // Simple approach: if the comments container has "No comments for this event", clear it.
                  const commentsList = document.getElementById("comments-list");
                  if (commentsList.innerHTML.includes("No comments for this event")) {
                    commentsList.innerHTML = "";
                  }
                  // Append the newly added comment to the comments list
                  const newCommentItem = document.createElement("div");
                  newCommentItem.classList.add("comment-item");
                  newCommentItem.innerHTML = `<p><strong>${commentResult.comment.author}</strong>: ${commentResult.comment.text} (Rating: ${commentResult.comment.rating})</p>`;
                  
                  // Add a delete button to the new comment
                  const newDeleteBtn = document.createElement("button");
                  newDeleteBtn.textContent = "Delete";
                  newDeleteBtn.classList.add("delete-comment-btn");
                  newDeleteBtn.addEventListener("click", function() {
                    if (confirm("Are you sure you want to delete this comment?")) {
                      fetch("api/deleteComment.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ comment_ID: commentResult.comment.comment_ID })
                      })
                      .then(response => response.json())
                      .then(deleteResult => {
                        if (deleteResult.success) {
                          newCommentItem.remove();
                        } else {
                          alert("Error deleting comment: " + deleteResult.error);
                        }
                      })
                      .catch(err => {
                        console.error("Error deleting comment:", err);
                      });
                    }
                  });
                  newCommentItem.appendChild(newDeleteBtn);
                  commentsList.appendChild(newCommentItem);
                  commentForm.reset();
                } else {
                  commentResultDiv.innerHTML = "<p>Error: " + commentResult.error + "</p>";
                }
              })
              .catch(error => {
                console.error("Error adding comment:", error);
                document.getElementById("comment-result").innerHTML = "<p>Error adding comment. Please try again.</p>";
              });
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
