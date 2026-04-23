<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$student_id = intval($data["student_id"] ?? 0);

if ($student_id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid student ID."]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM student WHERE student_id = ?");
    $stmt->execute([$student_id]);

    echo json_encode(["success" => true, "message" => "Student deleted successfully."]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete student: " . $e->getMessage()
    ]);
}
?>