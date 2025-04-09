<?php
// Set the response content type to JSON
header('Content-Type: application/json');

// Decode the input JSON
$data = json_decode(file_get_contents('php://input'), true);

// Get the comment_ID from the JSON payload
$comment_ID = isset($data['comment_ID']) ? $data['comment_ID'] : 0;

// Validate comment_ID
if (!is_numeric($comment_ID) || $comment_ID <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid comment_ID"]);
    exit();
}

// Connect to the database
$conn = new mysqli("localhost", "root", "", "COP4710");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit();
}

// Prepare the DELETE statement
$stmt = $conn->prepare("DELETE FROM Comments WHERE comment_ID = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Prepare failed: " . $conn->error]);
    exit();
}
$stmt->bind_param("i", $comment_ID);

// Execute the deletion
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Comment deleted successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to delete comment: " . $stmt->error]);
}

// Close the statement and the connection
$stmt->close();
$conn->close();
?>
