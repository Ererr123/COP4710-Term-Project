document.addEventListener("DOMContentLoaded", function () {
  // -------------------------------------------------
  // Registration Form Submission via AJAX
  // -------------------------------------------------
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const password = document.getElementById("reg-password").value;
      const confirmPassword = document.getElementById("reg-confirm-password").value;
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      const formData = new FormData(registerForm);

      fetch("api/register.php", {
        method: "POST",
        body: formData
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("userEmail", data.email);
            if (data.role === "admin" || data.role === "superadmin") {
              window.location.href = "dashboard.html";
            } else {
              window.location.href = "events.html";
            }
          } else {
            alert("Registration failed: " + data.error);
          }
        })
        .catch((error) => {
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
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(loginForm);

      fetch("api/login.php", {
        method: "POST",
        body: formData
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("userEmail", data.email);
            if (data.user) {
              localStorage.setItem("user", JSON.stringify(data.user));
            }
            if (data.role === "admin" || data.role === "superadmin") {
              window.location.href = "dashboard.html";
            } else {
              window.location.href = "events.html";
            }
          } else {
            alert("Login failed: " + data.error);
          }
        })
        .catch((error) => {
          console.error("Error during login:", error);
          alert("Login error, please try again.");
        });
    });
  }

  // -------------------------------------------------
  // Role-Based Sections on Dashboard
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
  // Dynamic Event Loading with Location Address
  // -------------------------------------------------
  const eventsList = document.getElementById("events-list");
  if (eventsList) {
    fetch("api/fetchEvents.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ISA_type: "Public" })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          data.events.forEach((event) => {
            fetch("api/fetchLocation.php", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ location_ID: event.location_ID })
            })
              .then((res) => res.json())
              .then((locationData) => {
                const locationAddress = locationData.success
                  ? locationData.location.address
                  : "Unknown";

                const eventCard = document.createElement("div");
                eventCard.classList.add("event-card");

                eventCard.innerHTML = `
                  <h3>${event.name}</h3>
                  <p><strong>Category:</strong> ${event.event_category}</p>
                  <p><strong>Date:</strong> ${event.event_date}</p>
                  <p><strong>Time:</strong> ${event.event_time}</p>
                  <p><strong>Location:</strong> ${locationAddress}</p>
                  <p><strong>Description:</strong> ${event.description}</p>
                `;

                eventsList.appendChild(eventCard);

                // Modal logic
                eventCard.addEventListener("click", function () {
                  const modal = document.getElementById("modal");
                  const modalBody = document.getElementById("modal-body");
                  modalBody.innerHTML = "";

                  const eventDetails = document.createElement("div");
                  eventDetails.innerHTML = eventCard.innerHTML;
                  modalBody.appendChild(eventDetails);

                  const commentsContainer = document.createElement("div");
                  commentsContainer.id = "comments-container";
                  commentsContainer.innerHTML =
                    "<h4>Comments</h4><div id='comments-list'><p>No comments for this event.</p></div>";
                  modalBody.appendChild(commentsContainer);

                  const eventID = event.event_ID;

                  function loadComments() {
                    fetch("api/fetchComments.php", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ event_ID: eventID })
                    })
                      .then((res) => res.json())
                      .then((commentData) => {
                        const commentsList = document.getElementById("comments-list");
                        if (commentData.success && commentData.comments.length > 0) {
                          commentsList.innerHTML = "";
                          commentData.comments.forEach((comment) => {
                            const commentItem = document.createElement("div");
                            commentItem.classList.add("comment-item");
                            commentItem.innerHTML = `<p><strong>${comment.author || "User #" + comment.user_ID}</strong>: ${comment.text} (Rating: ${comment.rating})</p>`;

                            const deleteBtn = document.createElement("button");
                            deleteBtn.textContent = "Delete";
                            deleteBtn.classList.add("delete-comment-btn");
                            deleteBtn.addEventListener("click", function () {
                              if (confirm("Are you sure you want to delete this comment?")) {
                                fetch("api/deleteComment.php", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ comment_ID: comment.comment_ID })
                                })
                                  .then((res) => res.json())
                                  .then((deleteResult) => {
                                    if (deleteResult.success) {
                                      commentItem.remove();
                                    } else {
                                      alert("Error deleting comment: " + deleteResult.error);
                                    }
                                  });
                              }
                            });

                            commentItem.appendChild(deleteBtn);
                            commentsList.appendChild(commentItem);
                          });
                        } else {
                          commentsList.innerHTML = "<p>No comments for this event.</p>";
                        }
                      });
                  }

                  loadComments();

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

                  const commentForm = document.getElementById("comment-form");
                  commentForm.addEventListener("submit", function (e) {
                    e.preventDefault();

                    const commentText = document.getElementById("comment-text").value;
                    const commentRating = document.getElementById("comment-rating").value;

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

                    fetch("api/createComment.php", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(commentObj)
                    })
                      .then((res) => res.json())
                      .then((commentResult) => {
                        const commentResultDiv = document.getElementById("comment-result");
                        if (commentResult.success) {
                          commentResultDiv.innerHTML = "<p>Comment added successfully!</p>";
                          const commentsList = document.getElementById("comments-list");
                          if (commentsList.innerHTML.includes("No comments")) {
                            commentsList.innerHTML = "";
                          }

                          const newCommentItem = document.createElement("div");
                          newCommentItem.classList.add("comment-item");
                          newCommentItem.innerHTML = `<p><strong>${commentResult.comment.author}</strong>: ${commentResult.comment.text} (Rating: ${commentResult.comment.rating})</p>`;

                          const newDeleteBtn = document.createElement("button");
                          newDeleteBtn.textContent = "Delete";
                          newDeleteBtn.classList.add("delete-comment-btn");
                          newDeleteBtn.addEventListener("click", function () {
                            if (confirm("Are you sure you want to delete this comment?")) {
                              fetch("api/deleteComment.php", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ comment_ID: commentResult.comment.comment_ID })
                              })
                                .then((res) => res.json())
                                .then((deleteResult) => {
                                  if (deleteResult.success) {
                                    newCommentItem.remove();
                                  } else {
                                    alert("Error deleting comment: " + deleteResult.error);
                                  }
                                });
                            }
                          });

                          newCommentItem.appendChild(newDeleteBtn);
                          commentsList.appendChild(newCommentItem);
                          commentForm.reset();
                        } else {
                          commentResultDiv.innerHTML = "<p>Error: " + commentResult.error + "</p>";
                        }
                      });
                  });

                  modal.style.display = "block";
                });
              })
              .catch((err) => {
                console.error("Error fetching location:", err);
              });
          });
        } else {
          eventsList.innerHTML = `<p>${data.error || "No events found."}</p>`;
        }
      })
      .catch((error) => {
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
    closeButton.addEventListener("click", function () {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", function (event) {
    if (modal && event.target === modal) {
      modal.style.display = "none";
    }
  });
});
