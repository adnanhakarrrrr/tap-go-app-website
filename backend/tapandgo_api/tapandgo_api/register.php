<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = "localhost";
$db   = "tapandgo_db";
$user = "root";
$pass = "";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    $input = json_decode(file_get_contents("php://input"), true);

    $fullName = trim($input["full_name"] ?? "");
    $email    = trim($input["email"] ?? "");
    $phone    = trim($input["phone"] ?? "");
    $password = trim($input["password"] ?? "");

    if ($fullName === "" || $email === "" || $phone === "" || $password === "") {
        throw new Exception("All fields are required.");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email address.");
    }

    $checkStmt = $pdo->prepare("SELECT student_id FROM student WHERE email = :email LIMIT 1");
    $checkStmt->execute([":email" => $email]);

    if ($checkStmt->fetch()) {
        throw new Exception("This email is already registered.");
    }

    $insertStmt = $pdo->prepare("
        INSERT INTO student (full_name, email, password, phone, credit_balance, card_id)
        VALUES (:full_name, :email, :password, :phone, 0.00, NULL)
    ");

    $insertStmt->execute([
        ":full_name" => $fullName,
        ":email" => $email,
        ":password" => $password,
        ":phone" => $phone
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Student registered successfully.",
        "student_id" => $pdo->lastInsertId()
    ]);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}