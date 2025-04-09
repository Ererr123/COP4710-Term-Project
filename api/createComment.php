<?php
// Decode the input JSON
$data = json_decode(file_get_contents('php://input'), true);

// Get inputs
$event_ID = $data['event_ID'] ?? 0;
$user_ID  = $data['user_ID'] ?? 0;
$text     = $data['text'] ?? '';
$rating   = $data['rating'] ?? 0;

// Validate required fields
if (empty($user_ID) || empty($event_ID) || empty($text) || empty($rating)) {
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

// Insert the new comment into Comments table
$stmt = $conn->prepare("INSERT INTO Comments (event_ID, user_ID, text, rating) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iisi", $event_ID, $user_ID, $text, $rating);

if ($stmt->execute()) {
    $newCommentId = $stmt->insert_id;
    $stmt->close();

    // Fetch the newly inserted comment along with the user's username using a JOIN
    $stmt2 = $conn->prepare("
      SELECT c.comment_ID,
             c.event_ID,
             c.user_ID,
             c.text,
             c.rating,
             c.timestamp,
             u.username AS author
      FROM Comments c
      JOIN Users u ON c.user_ID = u.UID
      WHERE c.comment_ID = ?
    ");
    $stmt2->bind_param("i", $newCommentId);
    $stmt2->execute();
    $result = $stmt2->get_result();

    if ($comment = $result->fetch_assoc()) {
        sendResultInfoAsJson(json_encode([
            "success" => true,
            "comment" => $comment,
            "error" => ""
        ]));
    } else {
        sendResultInfoAsJson(json_encode([
            "success" => false,
            "error" => "Comment created but not found"
        ]));
    }
    $stmt2->close();
} else {
    $stmt->close();
    echo json_encode(["error" => $conn->error]);
}

$conn->close();

// Function to send JSON result
function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
}
?>
