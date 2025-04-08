<?php

// Decode the input JSON
$data = json_decode(file_get_contents('php://input'), true);

// Get inputs
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$event_ID = $data['event_ID'] ?? 0;
$text = $data['text'] ?? '';
$rating = $data['rating'] ?? 0;

// Validate required fields
if (empty($username) || empty($password) || empty($event_ID) || empty($text) || empty($rating)) {
    http_response_code(400);
    echo json_encode(["error" => "All fields are required"]);
    exit();
}

// Validate rating range (1 to 5)
if ($rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(["error" => "Rating must be between 1 and 5"]);
    exit();
}

// Connect to the database
$conn = new mysqli("localhost", "root", "", "COP4710");
if ($conn->connect_error) {
    http_response_code(404);
    echo json_encode(["error" => "Could not connect to database"]);
    exit();
}

// Find the user who is posting the comment
$stmt = $conn->prepare("SELECT UID FROM Users WHERE username = ? AND password = ?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$user_result = $stmt->get_result();
$stmt->close();

// Check if the user exists
if ($user_result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid username or password"]);
    exit();
}

$user = $user_result->fetch_assoc();
$user_ID = $user['UID'];

// Insert the new comment
$stmt = $conn->prepare("INSERT INTO Comments (event_ID, user_ID, text, rating) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iisi", $event_ID, $user_ID, $text, $rating);

if ($stmt->execute()) {
    $newCommentId = $stmt->insert_id;
    $stmt->close();

    // Fetch the newly inserted comment
    $stmt2 = $conn->prepare("SELECT comment_ID, event_ID, user_ID, text, rating, timestamp FROM Comments WHERE comment_ID = ?");
    $stmt2->bind_param("i", $newCommentId);
    $stmt2->execute();
    $result = $stmt2->get_result();

    if ($comment = $result->fetch_assoc()) {
        sendResultInfoAsJson(json_encode(["success" => true, "comment" => $comment, "error" => ""]));
    } else {
        sendResultInfoAsJson(json_encode(["success" => false, "error" => "Comment created but not found"]));
    }

    $stmt2->close();
} else {
    $stmt->close();
    $retValue = ["error" => $stmt->error];
    sendResultInfoAsJson(json_encode($retValue));
}

$conn->close();

// Function to send JSON result
function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
}

?>
