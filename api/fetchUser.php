<?php

// Read and decode the input JSON
$data = json_decode(file_get_contents('php://input'), true);

// Get UID from input
$UID = $data['UID'] ?? 0;

// Validate UID
if (!is_numeric($UID) || $UID <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "user" => null,
        "error" => "Invalid or missing UID"
    ]);
    exit();
}

// Database connection
$conn = new mysqli("localhost", "root", "", "COP4710");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "user" => null,
        "error" => "Database connection failed"
    ]);
    exit();
}

// Prepare query to fetch user without password
$stmt = $conn->prepare("SELECT UID, username, name, user_type, university_ID, created_at FROM Users WHERE UID = ?");
$stmt->bind_param("i", $UID);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    sendResultAsJson([
        "success" => true,
        "user" => $row,
        "error" => ""
    ]);
} else {
    sendResultAsJson([
        "success" => false,
        "user" => null,
        "error" => "User not found"
    ]);
}

$stmt->close();
$conn->close();

function sendResultAsJson($response) {
    header('Content-Type: application/json');
    echo json_encode($response);
}

?>
