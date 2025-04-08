<?php

// Decode input JSON
$data = json_decode(file_get_contents('php://input'), true);

// Get inputs
$username = $data['username'] ?? '';
$name = $data['name'] ?? '';
$password = $data['password'] ?? '';
$event_name = $data['event_name'] ?? '';
$event_category = $data['event_category'] ?? '';
$description = $data['description'] ?? '';
$event_time = $data['event_time'] ?? '';
$event_date = $data['event_date'] ?? '';
$contact_phone = $data['contact_phone'] ?? '';
$contact_email = $data['contact_email'] ?? '';
$location_ID = $data['location_ID'] ?? 0;
$ISA_type = $data['ISA_type'] ?? '';
$university_ID = $data['university_ID'] ?? 0;

// Validate required fields
if (empty($username) || empty($password) || empty($event_name) || empty($ISA_type) || empty($university_ID)) {
    http_response_code(400);
    echo json_encode(["error" => "Fields cannot be empty"]);
    exit();
}

// Connect to database
$conn = new mysqli("localhost", "root", "", "COP4710");
if ($conn->connect_error) {
    http_response_code(404);
    echo json_encode(["error" => "Could not connect to database"]);
    exit();
}

// Find the user who created the event (assuming the user exists)
$stmt = $conn->prepare("SELECT UID FROM Users WHERE username = ? AND password = ?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$user_result = $stmt->get_result();
$stmt->close();

// Check if user exists
if ($user_result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid username or password"]);
    exit();
}

$user = $user_result->fetch_assoc();
$created_by_UID = $user['UID'];

// Insert new event
$stmt = $conn->prepare("INSERT INTO Events (name, event_category, description, event_time, event_date, contact_phone, contact_email, location_ID, university_ID, ISA_type, created_by_UID) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssssisi", $event_name, $event_category, $description, $event_time, $event_date, $contact_phone, $contact_email, $location_ID, $university_ID, $ISA_type, $created_by_UID);

if ($stmt->execute()) {
    $newEventId = $stmt->insert_id;
    $stmt->close();

    // Fetch the newly inserted event
    $stmt2 = $conn->prepare("SELECT event_ID, name, event_category, description, event_time, event_date, contact_phone, contact_email, location_ID, university_ID, ISA_type, created_at, created_by_UID FROM Events WHERE event_ID = ?");
    $stmt2->bind_param("i", $newEventId);
    $stmt2->execute();
    $result = $stmt2->get_result();

    if ($event = $result->fetch_assoc()) {
        sendResultInfoAsJson(json_encode(["success" => true, "event" => $event, "error" => ""]));
    } else {
        sendResultInfoAsJson(json_encode(["success" => false, "error" => "Event created but not found"]));
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
