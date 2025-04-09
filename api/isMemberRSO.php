<?php

// Read and decode input JSON
$data = json_decode(file_get_contents("php://input"), true);

// Get input values
$RSO_ID = $data['RSO_ID'] ?? null;
$user_ID = $data['user_ID'] ?? null;

// Validate inputs
if (!is_numeric($RSO_ID) || !is_numeric($user_ID)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "is_member" => false,
        "error" => "Missing or invalid RSO_ID or user_ID"
    ]);
    exit();
}

// Connect to DB
$conn = new mysqli("localhost", "root", "", "COP4710");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "is_member" => false,
        "error" => "Database connection failed"
    ]);
    exit();
}

// Check if user is a member of the RSO
$stmt = $conn->prepare("SELECT 1 FROM RSO_Members WHERE RSO_ID = ? AND user_ID = ?");
$stmt->bind_param("ii", $RSO_ID, $user_ID);
$stmt->execute();
$result = $stmt->get_result();

$is_member = $result->num_rows > 0;

echo json_encode([
    "success" => true,
    "is_member" => $is_member,
    "error" => ""
]);

$stmt->close();
$conn->close();

?>
