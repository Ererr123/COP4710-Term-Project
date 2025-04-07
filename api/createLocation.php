<?php

// Decode the input JSON
$data = json_decode(file_get_contents('php://input'), true);

// Get inputs
$name = $data['name'] ?? '';
$latitude = $data['latitude'] ?? 0;
$longitude = $data['longitude'] ?? 0;

// Validate required fields
if (empty($name) || !is_numeric($latitude) || !is_numeric($longitude)) {
    http_response_code(400);
    echo json_encode(["error" => "All fields are required and latitude/longitude must be numbers"]);
    exit();
}

// Connect to the database
$conn = new mysqli("localhost", "root", "", "COP4710");
if ($conn->connect_error) {
    http_response_code(404);
    echo json_encode(["error" => "Could not connect to database"]);
    exit();
}

// Insert the new location
$stmt = $conn->prepare("INSERT INTO Location (name, latitude, longitude) VALUES (?, ?, ?)");
$stmt->bind_param("sdd", $name, $latitude, $longitude);

if ($stmt->execute()) {
    $newLocationId = $stmt->insert_id;
    $stmt->close();

    // Fetch the newly inserted location
    $stmt2 = $conn->prepare("SELECT location_ID, name, latitude, longitude FROM Location WHERE location_ID = ?");
    $stmt2->bind_param("i", $newLocationId);
    $stmt2->execute();
    $result = $stmt2->get_result();

    if ($location = $result->fetch_assoc()) {
        sendResultInfoAsJson(json_encode(["success" => true, "location" => $location, "error" => ""]));
    } else {
        sendResultInfoAsJson(json_encode(["success" => false, "error" => "Location created but not found"]));
    }

    $stmt2->close();
} else {
    $stmt->close();
    $retValue = ["error" => $stmt->error];
    sendResultInfoAsJson(json_encode($retValue));
}

$conn->close();

// Function to send JSON result
function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
}

?>
