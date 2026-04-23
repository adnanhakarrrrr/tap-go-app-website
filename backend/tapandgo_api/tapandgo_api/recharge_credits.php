<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$student_id = intval($data["student_id"] ?? 0);
$amount = floatval($data["amount"] ?? 0);
$description = trim($data["description"] ?? "");

if ($student_id <= 0 || $amount <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Valid student and amount are required."
    ]);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("SELECT credit_balance FROM student WHERE student_id = ? LIMIT 1");
    $stmt->execute([$student_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "Student not found."
        ]);
        exit;
    }

    $new_balance = floatval($student["credit_balance"]) + $amount;

    $updateStmt = $pdo->prepare("
        UPDATE student
        SET credit_balance = ?
        WHERE student_id = ?
    ");
    $updateStmt->execute([$new_balance, $student_id]);

    $insertStmt = $pdo->prepare("
        INSERT INTO transactions (student_id, type, title, amount, description)
        VALUES (?, ?, ?, ?, ?)
    ");
    $insertStmt->execute([
        $student_id,
        "recharge",
        "Credit Recharge",
        $amount,
        $description !== "" ? $description : "Admin recharge"
    ]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Recharge completed successfully.",
        "new_balance" => number_format($new_balance, 2, '.', '')
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode([
        "success" => false,
        "message" => "Recharge failed: " . $e->getMessage()
    ]);
}
?>