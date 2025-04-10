<?php

// Connect to the database
$conn = new mysqli("localhost", "root", "", "COP4710");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "universities" => [],
        "error" => "Database connection failed"
    ]);
    exit();
}

// Query to fetch all universities
$query = "SELECT university_ID, name, location_ID, description, num_of_students FROM Universities";
$result = $conn->query($query);

$universities = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $universities[] = $row;
    }

    echo json_encode([
        "success" => true,
        "universities" => $universities,
        "error" => ""
    ]);
} else {
    echo json_encode([
        "success" => false,
        "universities" => [],
        "error" => "Failed to fetch universities"
    ]);
}

$conn->close();

?>
