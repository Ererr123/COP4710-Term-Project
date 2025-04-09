<?php

// Read and decode input JSON
$data = json_decode(file_get_contents('php://input'), true);

// Get university_ID from input
$university_ID = $data['university_ID'] ?? 0;

// Validate input
if (!is_numeric($university_ID) || $university_ID <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "university" => null,
        "error" => "Invalid or missing university_ID"
    ]);
    exit();
}

// Connect to the database
$conn = new mysqli("localhost", "root", "", "COP4710");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "university" => null,
        "error" => "Database connection failed"
    ]);
    exit();
}

// Prepare and execute query
$stmt = $conn->prepare("SELECT university_ID, name, location_ID, description, num_of_students FROM Universities WHERE university_ID = ?");
$stmt->bind_param("i", $university_ID);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    sendResultAsJson([
        "success" => true,
        "university" => $row,
        "error" => ""
    ]);
} else {
    sendResultAsJson([
        "success" => false,
        "university" => null,
        "error" => "University not found"
    ]);
}

$stmt->close();
$conn->close();

function sendResultAsJson($response) {
    header('Content-Type: application/json');
    echo json_encode($response);
}

?>
