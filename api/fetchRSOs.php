<?php

// Connect to the database
$conn = new mysqli("localhost", "root", "", "COP4710");

// Check for connection errors
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "rsos" => [], "error" => "Database connection failed"]);
    exit();
}

// Prepare and execute the query
$query = "SELECT RSO_ID, name, university_ID, created_at, admin_ID, status FROM RSOs";
$result = $conn->query($query);

// Collect RSO rows
$rsos = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $rsos[] = $row;
    }
    sendResultAsJson(["success" => true, "rsos" => $rsos, "error" => ""]);
} else {
    sendResultAsJson(["success" => true, "rsos" => [], "error" => "No RSOs found"]);
}

$conn->close();

function sendResultAsJson($response) {
    header('Content-Type: application/json');
    echo json_encode($response);
}

?>
