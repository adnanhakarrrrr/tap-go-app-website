<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db.php";

try {
    $studentId = trim($_GET["student_id"] ?? "");

    if ($studentId === "") {
        throw new Exception("Student ID is required.");
    }

    $stmt = $pdo->prepare("
        SELECT student_id, full_name, email, phone, credit_balance
        FROM student
        WHERE student_id = ?
        LIMIT 1
    ");
    $stmt->execute([$studentId]);

    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception("Student not found.");
    }

    echo json_encode([
        "success" => true,
        "student" => [
            "student_id" => $student["student_id"],
            "full_name" => $student["full_name"],
            "email" => $student["email"],
            "phone" => $student["phone"],
            "credit_balance" => $student["credit_balance"]
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>