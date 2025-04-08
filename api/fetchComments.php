<?php

// Decode JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Get the event_ID from request
$event_ID = $data['event_ID'] ?? 0;

// Validate event_ID
if (!is_numeric($event_ID) || $event_ID <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "comments" => [], "error" => "Invalid or missing event_ID"]);
    exit();
}

// Connect to database
$conn = new mysqli("localhost", "root", "", "COP4710");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "comments" => [], "error" => "Database connection failed"]);
    exit();
}

// Prepare and execute query
$stmt = $conn->prepare("SELECT comment_ID, event_ID, user_ID, text, rating, timestamp FROM Comments WHERE event_ID = ?");
$stmt->bind_param("i", $event_ID);
$stmt->execute();
$result = $stmt->get_result();

// Fetch comments
$comments = [];
while ($row = $result->fetch_assoc()) {
    $comments[] = $row;
}

// Response
if (count($comments) > 0) {
    sendResultAsJson(["success" => true, "comments" => $comments, "error" => ""]);
} else {
    sendResultAsJson(["success" => true, "comments" => [], "error" => "No comments found for this event_ID"]);
}

$stmt->close();
$conn->close();

function sendResultAsJson($response) {
    header('Content-Type: application/json');
    echo json_encode($response);
}

?>
