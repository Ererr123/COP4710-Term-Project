<?php

	$data = json_decode(file_get_contents('php://input'), true);
	
	$UID = 0;
	
	$username = $data['username'] ?? '';
	$password = $data['password'] ?? '';
	
	if (empty($username) || empty($password)) {
		http_response_code(400);
		echo json_encode(["error" => "Username and password are required"]);
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
		$stmt = $conn->prepare("SELECT * FROM Users WHERE username=? AND password =?");
		$stmt->bind_param("ss", $username, $password);
		$stmt->execute();
		$result = $stmt->get_result();

		if( $row = $result->fetch_assoc()  )
		{
			$retValue = [
				"id" => $row['UID'],
				"username" => $row['username'],
				"password" => $row['password'],
				"university_ID" => $row['university_ID'],
				"error" => ""
			];
			sendResultInfoAsJson(json_encode($retValue));
		}
		else
		{
			$retValue = [
				"id" => 0,
				"username" => "",
				"password" => "",
				"university_ID" => "",
				"error" => ""
			];
			sendResultInfoAsJson(json_encode($retValue));
		}

		$stmt->close();
		$conn->close();
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
?>