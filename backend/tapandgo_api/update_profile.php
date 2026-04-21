<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db.php";

try {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) {
        throw new Exception("Invalid JSON data.");
    }

    $studentId = trim($input["student_id"] ?? "");
    $fullName  = trim($input["full_name"] ?? "");
    $email     = trim($input["email"] ?? "");
    $phone     = trim($input["phone"] ?? "");

    if ($studentId === "" || $fullName === "" || $email === "" || $phone === "") {
        throw new Exception("All fields are required.");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email address.");
    }

    $checkStmt = $pdo->prepare("
        SELECT student_id
        FROM student
        WHERE email = ?
          AND student_id != ?
        LIMIT 1
    ");
    $checkStmt->execute([$email, $studentId]);

    if ($checkStmt->fetch()) {
        throw new Exception("This email is already used by another account.");
    }

    $updateStmt = $pdo->prepare("
        UPDATE student
        SET full_name = ?, email = ?, phone = ?
        WHERE student_id = ?
    ");
    $updateStmt->execute([$fullName, $email, $phone, $studentId]);

    echo json_encode([
        "success" => true,
        "message" => "Profile updated successfully."
    ]);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>