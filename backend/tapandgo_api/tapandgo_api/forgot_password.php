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

    $studentId   = trim($input["student_id"] ?? "");
    $email       = trim($input["email"] ?? "");
    $newPassword = trim($input["new_password"] ?? "");

    if ($studentId === "" || $email === "" || $newPassword === "") {
        throw new Exception("All fields are required.");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email address.");
    }

    if (strlen($newPassword) < 6) {
        throw new Exception("Password must be at least 6 characters long.");
    }

    $stmt = $pdo->prepare("
        SELECT student_id
        FROM student
        WHERE student_id = ? AND email = ?
        LIMIT 1
    ");
    $stmt->execute([$studentId, $email]);

    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception("Student ID and email do not match.");
    }

   $updateStmt = $pdo->prepare("
    UPDATE student
    SET password = ?
    WHERE student_id = ?
");
$updateStmt->execute([$newPassword, $studentId]);

    $updateStmt = $pdo->prepare("
        UPDATE student
        SET password = ?
        WHERE student_id = ?
    ");
    $updateStmt->execute([$newPassword, $studentId]);

    echo json_encode([
        "success" => true,
        "message" => "Password reset successfully."
    ]);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>