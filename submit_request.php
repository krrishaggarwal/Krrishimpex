<?php
header('Content-Type: application/json');

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '1111';
$db_name = 'krrish_impex';

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}

// Get form data
$name = $conn->real_escape_string($_POST['name'] ?? '');
$email = $conn->real_escape_string($_POST['email'] ?? '');
$phone = $conn->real_escape_string($_POST['phone'] ?? '');
$subject = $conn->real_escape_string($_POST['subject'] ?? 'general');
$message = $conn->real_escape_string($_POST['message'] ?? '');

// Validate required fields
if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Name, email, and message are required']);
    exit;
}

// Insert into database
$sql = "INSERT INTO contact_requests (name, email, phone, subject, message) 
        VALUES ('$name', '$email', '$phone', '$subject', '$message')";

if ($conn->query($sql)) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your message! We will get back to you soon.'
    ]);
}
 else {
    echo json_encode(['success' => false, 'message' => 'Error submitting your request. Please try again later.']);
}

$conn->close();
?>