<?php

// Decode the input JSON
$data = json_decode(file_get_contents('php://input'), true);

// Get the ISA_type input
$ISA_type = $data['ISA_type'] ?? '';

// Validate the ISA_type input
if (empty($ISA_type) || !in_array($ISA_type, ['RSO', 'Private', 'Public'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid or missing ISA_type. It must be 'RSO', 'Private', or 'Public'"]);
    exit();
}

// Connect to the database
$conn = new mysqli("localhost", "root", "", "COP4710");
if ($conn->connect_error) {
    http_response_code(404);
    echo json_encode(["error" => "Could not connect to database"]);
    exit();
}

// Prepare the query to fetch events based on ISA_type
$stmt = $conn->prepare("SELECT event_ID, name, event_category, description, event_time, event_date, contact_phone, contact_email, location_ID, university_ID, ISA_type, created_at, created_by_UID FROM Events WHERE ISA_type = ?");
$stmt->bind_param("s", $ISA_type);

// Execute the query
$stmt->execute();
$result = $stmt->get_result();

// Check if any events are found
if ($result->num_rows > 0) {
    // Fetch all events
    $events = [];
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }

    // Return the events as JSON
    sendResultInfoAsJson(json_encode(["success" => true, "events" => $events, "error" => ""]));
} else {
    // No events found
    sendResultInfoAsJson(json_encode(["success" => false, "events" => [], "error" => "No events found for the specified ISA_type"]));
}

$stmt->close();
$conn->close();

// Function to send JSON result
function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
}

?>
