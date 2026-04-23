<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$full_name = trim($data["full_name"] ?? "");
$email = trim($data["email"] ?? "");
$password = trim($data["password"] ?? "");
$phone = trim($data["phone"] ?? "");
$credit_balance = trim($data["credit_balance"] ?? "0");
$card_id = trim($data["card_id"] ?? "");

if ($full_name === "" || $email === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "Required fields are missing."]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO student (full_name, email, password, phone, credit_balance, card_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $full_name,
        $email,
        $password,
        $phone !== "" ? $phone : null,
        $credit_balance !== "" ? $credit_balance : 0,
        $card_id !== "" ? $card_id : null
    ]);

    echo json_encode(["success" => true, "message" => "Student created successfully."]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to create student: " . $e->getMessage()
    ]);
}
?>