<?php

// Decode JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Get the location_ID from request
$location_ID = $data['location_ID'] ?? 0;

// Validate location_ID
if (!is_numeric($location_ID) || $location_ID <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "location" => null, "error" => "Invalid or missing location_ID"]);
    exit();
}

// Connect to database
$conn = new mysqli("localhost", "root", "", "COP4710");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "location" => null, "error" => "Database connection failed"]);
    exit();
}

// Prepare and execute query
$stmt = $conn->prepare("SELECT location_ID, address FROM Location WHERE location_ID = ?");
$stmt->bind_param("i", $location_ID);
$stmt->execute();
$result = $stmt->get_result();

// Fetch location
if ($row = $result->fetch_assoc()) {
    sendResultAsJson(["success" => true, "location" => $row, "error" => ""]);
} else {
    sendResultAsJson(["success" => false, "location" => null, "error" => "Location not found"]);
}

$stmt->close();
$conn->close();

function sendResultAsJson($response) {
    header('Content-Type: application/json');
    echo json_encode($response);
}

?>
