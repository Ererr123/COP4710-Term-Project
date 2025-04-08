<?php

	$data = json_decode(file_get_contents('php://input'), true);
	
	$UID = 0;
	
	$username = $data['username'] ?? '';
	$name = $data['name'] ?? '';
	$password = $data['password'] ?? '';
	$university_ID = $data['university_ID'] ?? 0;
	
	if (empty($username) || empty($password) || empty($name) || empty($university_ID)) {
		http_response_code(400);
		echo json_encode(["error" => "Fields cannot be empty"]);
		exit();
	}

	$conn = new mysqli("localhost", "root", "", "COP4710"); 	
	if( $conn->connect_error )
	{
		http_response_code(404);
		echo json_encode(["error" => "Could not connect to database"]);
		exit();
	}
	else
	{
		$stmt = $conn->prepare("INSERT INTO Users (username, password, name, university_ID) VALUES (?, ?, ?, ?);");
		$stmt->bind_param("sssi", $username, $password, $name, $university_ID);

		if( $stmt->execute() )
		{
			$newUserId = $stmt->insert_id;
			$stmt->close();

			// Fetch the newly inserted row
			$stmt2 = $conn->prepare("SELECT UID, username, university_ID FROM Users WHERE UID = ?");
			$stmt2->bind_param("i", $newUserId);
			$stmt2->execute();
			$result = $stmt2->get_result();

			if ($user = $result->fetch_assoc()) {
				sendResultInfoAsJson(json_encode(["success" => true, "user" => $user, "error" => ""]));
			} else {
				sendResultInfoAsJson(json_encode(["success" => false, "error" => "User created but not found"]));
			}

			$stmt2->close();
		}
		else
		{
			$stmt->close();
			$retValue = [
				"error" => $stmt->error
			];
			sendResultInfoAsJson(json_encode($retValue));
		}

		$conn->close();
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
?>