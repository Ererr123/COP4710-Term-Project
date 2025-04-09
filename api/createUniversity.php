<?php

// Read and decode JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Extract fields with defaults
$name = $data['name'] ?? '';
$location_ID = $data['location_ID'] ?? null;
$description = $data['description'] ?? '';
$num_of_students = $data['num_of_students'] ?? null;

// Validate required fields
if (empty($name) || !is_numeric($location_ID) || !is_numeric($num_of_students)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "university" => null,
        "error" => "Missing or invalid required fields"
    ]);
    exit();
}

// Connect to database
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

// Insert university
$stmt = $conn->prepare("INSERT INTO Universities (name, location_ID, description, num_of_students) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sisi", $name, $location_ID, $description, $num_of_students);

if ($stmt->execute()) {
    $inserted_id = $stmt->insert_id;
    $stmt->close();

    // Fetch the inserted university
    $stmt2 = $conn->prepare("SELECT * FROM Universities WHERE university_ID = ?");
    $stmt2->bind_param("i", $inserted_id);
    $stmt2->execute();
    $result = $stmt2->get_result();

    if ($university = $result->fetch_assoc()) {
        sendJsonResponse([
            "success" => true,
            "university" => $university,
            "error" => ""
        ]);
    } else {
        sendJsonResponse([
            "success" => false,
            "university" => null,
            "error" => "University inserted but not found"
        ]);
    }

    $stmt2->close();
} else {
    sendJsonResponse([
        "success" => false,
        "university" => null,
        "error" => $stmt->error
    ]);
    $stmt->close();
}

$conn->close();

// JSON output function
function sendJsonResponse($response) {
    header('Content-Type: application/json');
    echo json_encode($response);
}

?>
