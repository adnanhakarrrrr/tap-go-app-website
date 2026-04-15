<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = "localhost";
$db   = "tapandgo_db";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $input = json_decode(file_get_contents("php://input"), true);

    $studentId = (int)($input['student_id'] ?? 0);
    $busId = (int)($input['bus_id'] ?? 0);
    $bookingDay = trim($input['booking_day'] ?? '');

    if ($studentId <= 0 || $busId <= 0 || $bookingDay === '') {
        throw new Exception("Missing required fields.");
    }

    $stmt = $pdo->prepare("SELECT capacity, booked_seats FROM buses WHERE id = :id AND is_active = 1");
    $stmt->execute([':id' => $busId]);
    $bus = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$bus) {
        throw new Exception("Bus not found.");
    }

    if ((int)$bus['booked_seats'] >= (int)$bus['capacity']) {
        throw new Exception("This bus is full.");
    }

    $checkStmt = $pdo->prepare("
        SELECT id FROM bookings
        WHERE student_id = :student_id
          AND bus_id = :bus_id
          AND booking_day = :booking_day
        LIMIT 1
    ");
    $checkStmt->execute([
        ':student_id' => $studentId,
        ':bus_id' => $busId,
        ':booking_day' => $bookingDay
    ]);

    if ($checkStmt->fetch()) {
        throw new Exception("You already booked this bus for this day.");
    }

    $pdo->beginTransaction();

    $insertStmt = $pdo->prepare("
        INSERT INTO bookings (student_id, bus_id, booking_day)
        VALUES (:student_id, :bus_id, :booking_day)
    ");
    $insertStmt->execute([
        ':student_id' => $studentId,
        ':bus_id' => $busId,
        ':booking_day' => $bookingDay
    ]);

    $updateStmt = $pdo->prepare("
        UPDATE buses
        SET booked_seats = booked_seats + 1
        WHERE id = :id
    ");
    $updateStmt->execute([':id' => $busId]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Booking successful."
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}