<?php

// Read and decode input JSON
$data = json_decode(file_get_contents("php://input"), true);

// Get RSO_ID from input
$RSO_ID = $data['RSO_ID'] ?? null;

// Validate input
if (!is_numeric($RSO_ID)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "member_count" => 0,
        "error" => "Missing or invalid RSO_ID"
    ]);
    exit();
}

// Connect to database
$conn = new mysqli("localhost", "root", "", "COP4710");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "member_count" => 0,
        "error" => "Database connection failed"
    ]);
    exit();
}

// Prepare and execute COUNT query
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM RSO_Members WHERE RSO_ID = ?");
$stmt->bind_param("i", $RSO_ID);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode([
        "success" => true,
        "member_count" => intval($row['count']),
        "error" => ""
    ]);
} else {
    echo json_encode([
        "success" => false,
        "member_count" => 0,
        "error" => "Failed to retrieve member count"
    ]);
}

$stmt->close();
$conn->close();

?>
