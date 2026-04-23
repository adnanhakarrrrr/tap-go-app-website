<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data"
    ]);
    exit;
}

$studentId = trim($data['studentId'] ?? '');
$password = trim($data['password'] ?? '');

if ($studentId === '' || $password === '') {
    echo json_encode([
        "success" => false,
        "message" => "Student ID and password are required"
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM student WHERE student_id = ? LIMIT 1");
    $stmt->execute([$studentId]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        echo json_encode([
            "success" => false,
            "message" => "Student not found"
        ]);
        exit;
    }

    if ($student['password'] !== $password) {
        echo json_encode([
            "success" => false,
            "message" => "Incorrect password"
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "student" => [

            "student_id" => $student['student_id'],
            "full_name" => $student['full_name'],
            "email" => $student['email'],
            "credit_balance" => $student['credit_balance']
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>