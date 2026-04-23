<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once "db.php";

try {
    $stmt = $pdo->query("
        SELECT
            t.id,
            t.student_id,
            t.type,
            t.title,
            t.amount,
            t.description,
            t.created_at,
            s.full_name
        FROM transactions t
        INNER JOIN student s ON s.student_id = t.student_id
        ORDER BY t.id DESC
        LIMIT 20
    ");

    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "transactions" => $transactions
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load transactions: " . $e->getMessage()
    ]);
}
?>