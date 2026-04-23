<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$week_start = trim($data["week_start"] ?? "");
$week_end = trim($data["week_end"] ?? "");
$category = trim($data["category"] ?? "");
$title = trim($data["title"] ?? "");
$amount = floatval($data["amount"] ?? 0);
$notes = trim($data["notes"] ?? "");

if ($week_start === "" || $week_end === "" || $category === "" || $title === "" || $amount <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "All required fields must be filled correctly."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO weekly_expenses (week_start, week_end, category, title, amount, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$week_start, $week_end, $category, $title, $amount, $notes ?: null]);

    echo json_encode([
        "success" => true,
        "message" => "Expense added successfully."
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to add expense: " . $e->getMessage()
    ]);
}
?>