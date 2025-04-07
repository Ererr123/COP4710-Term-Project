<?php

// Decode the input JSON
$data = json_decode(file_get_contents('php://input'), true);

// Get inputs
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$rso_name = $data['rso_name'] ?? '';
$university_ID = $data['university_ID'] ?? 0;

// Validate required fields
if (empty($username) || empty($password) || empty($rso_name) || empty($university_ID)) {
    http_response_code(400);
    echo json_encode(["error" => "Fields cannot be empty"]);
    exit();
}

// Connect to the database
$conn = new mysqli("localhost", "root", "", "COP4710");
if ($conn->connect_error) {
    http_response_code(404);
    echo json_encode(["error" => "Could not connect to database"]);
    exit();
}

// Find the user who will be the admin of the RSO
$stmt = $conn->prepare("SELECT UID FROM Users WHERE username = ? AND password = ?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$user_result = $stmt->get_result();
$stmt->close();

// Check if the user exists
if ($user_result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid username or password"]);
    exit();
}

$user = $user_result->fetch_assoc();
$admin_ID = $user['UID'];

// Insert the new RSO
$stmt = $conn->prepare("INSERT INTO RSOs (name, university_ID, admin_ID) VALUES (?, ?, ?)");
$stmt->bind_param("sii", $rso_name, $university_ID, $admin_ID);

if ($stmt->execute()) {
    $newRsoId = $stmt->insert_id;
    $stmt->close();

    // Fetch the newly inserted RSO
    $stmt2 = $conn->prepare("SELECT RSO_ID, name, university_ID, status, created_at, admin_ID FROM RSOs WHERE RSO_ID = ?");
    $stmt2->bind_param("i", $newRsoId);
    $stmt2->execute();
    $result = $stmt2->get_result();

    if ($rso = $result->fetch_assoc()) {
        sendResultInfoAsJson(json_encode(["success" => true, "rso" => $rso, "error" => ""]));
    } else {
        sendResultInfoAsJson(json_encode(["success" => false, "error" => "RSO created but not found"]));
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
