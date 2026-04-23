<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$student_id = intval($data["student_id"] ?? 0);
$full_name = trim($data["full_name"] ?? "");
$email = trim($data["email"] ?? "");
$password = trim($data["password"] ?? "");
$phone = trim($data["phone"] ?? "");
$credit_balance = trim($data["credit_balance"] ?? "0");
$card_id = trim($data["card_id"] ?? "");

if ($student_id <= 0 || $full_name === "" || $email === "") {
    echo json_encode(["success" => false, "message" => "Required fields are missing."]);
    exit;
}

try {
    if ($password !== "") {
        $stmt = $pdo->prepare("
            UPDATE student
            SET full_name = ?, email = ?, password = ?, phone = ?, credit_balance = ?, card_id = ?
            WHERE student_id = ?
        ");
        $stmt->execute([
            $full_name,
            $email,
            $password,
            $phone !== "" ? $phone : null,
            $credit_balance !== "" ? $credit_balance : 0,
            $card_id !== "" ? $card_id : null,
            $student_id
        ]);
    } else {
        $stmt = $pdo->prepare("
            UPDATE student
            SET full_name = ?, email = ?, phone = ?, credit_balance = ?, card_id = ?
            WHERE student_id = ?
        ");
        $stmt->execute([
            $full_name,
            $email,
            $phone !== "" ? $phone : null,
            $credit_balance !== "" ? $credit_balance : 0,
            $card_id !== "" ? $card_id : null,
            $student_id
        ]);
    }

    echo json_encode(["success" => true, "message" => "Student updated successfully."]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update student: " . $e->getMessage()
    ]);
}
?>