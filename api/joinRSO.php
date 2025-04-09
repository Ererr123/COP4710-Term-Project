<?php

// Read and decode input JSON
$data = json_decode(file_get_contents("php://input"), true);

// Get required fields
$RSO_ID = $data['RSO_ID'] ?? null;
$user_ID = $data['user_ID'] ?? null;

// Validate input
if (!is_numeric($RSO_ID) || !is_numeric($user_ID)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Missing or invalid RSO_ID or user_ID"
    ]);
    exit();
}

// Connect to database
$conn = new mysqli("localhost", "root", "", "COP4710");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database connection failed"
    ]);
    exit();
}

// Prepare and execute INSERT
$stmt = $conn->prepare("INSERT INTO RSO_Members (RSO_ID, user_ID) VALUES (?, ?)");
$stmt->bind_param("ii", $RSO_ID, $user_ID);

if ($stmt->execute()) {
    sendJsonResponse([
        "success" => true,
        "error" => ""
    ]);
} else {
    // Handle duplicate or constraint error
    sendJsonResponse([
        "success" => false,
        "error" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();

// Output response
function sendJsonResponse($response) {
    header('Content-Type: application/json');
    echo json_encode($response);
}

?>
