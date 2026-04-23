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
    $incomeStmt = $pdo->prepare("
        SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS recharge_count
        FROM transactions
        WHERE type = 'recharge'
        AND DATE(created_at) BETWEEN ? AND ?
    ");
    $incomeStmt->execute([$week_start, $week_end]);
    $incomeRow = $incomeStmt->fetch(PDO::FETCH_ASSOC);

    $totalIncome = floatval($incomeRow["total"]);
    $rechargeCount = intval($incomeRow["recharge_count"]);

    $expenseStmt = $pdo->prepare("
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM weekly_expenses
        WHERE week_start = ? AND week_end = ?
    ");
    $expenseStmt->execute([$week_start, $week_end]);
    $totalExpenses = floatval($expenseStmt->fetch(PDO::FETCH_ASSOC)["total"]);

    $byCategoryStmt = $pdo->prepare("
        SELECT category, COALESCE(SUM(amount), 0) AS total
        FROM weekly_expenses
        WHERE week_start = ? AND week_end = ?
        GROUP BY category
    ");
    $byCategoryStmt->execute([$week_start, $week_end]);
    $expensesByCategory = $byCategoryStmt->fetchAll(PDO::FETCH_ASSOC);

    $dailyIncomeStmt = $pdo->prepare("
        SELECT DATE(created_at) AS day, COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE type = 'recharge'
        AND DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
    ");
    $dailyIncomeStmt->execute([$week_start, $week_end]);
    $dailyIncome = $dailyIncomeStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "summary" => [
            "total_income" => number_format($totalIncome, 2, '.', ''),
            "total_expenses" => number_format($totalExpenses, 2, '.', ''),
            "net_profit" => number_format($totalIncome - $totalExpenses, 2, '.', ''),
            "recharge_count" => $rechargeCount
        ],
        "expenses_by_category" => $expensesByCategory,
        "daily_income" => $dailyIncome
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load report: " . $e->getMessage()
    ]);
}
?>