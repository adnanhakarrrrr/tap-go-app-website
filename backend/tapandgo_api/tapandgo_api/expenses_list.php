<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once "db.php";

$week_start = $_GET["week_start"] ?? "";
$week_end = $_GET["week_end"] ?? "";

if ($week_start === "" || $week_end === "") {
    echo json_encode([
        "success" => false,
        "message" => "week_start and week_end are required."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT *
        FROM weekly_expenses
        WHERE week_start = ? AND week_end = ?
        ORDER BY id DESC
    ");
    $stmt->execute([$week_start, $week_end]);
    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "expenses" => $expenses
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load expenses: " . $e->getMessage()
    ]);
}
?>