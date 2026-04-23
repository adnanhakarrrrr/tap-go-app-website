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

define("RIDE_PRICE", 1.00);

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

    $studentId  = (int)($input['student_id'] ?? 0);
    $busId      = (int)($input['bus_id'] ?? 0);
    $bookingDay = trim($input['booking_day'] ?? '');

    if ($studentId <= 0 || $busId <= 0 || $bookingDay === '') {
        throw new Exception("Missing required fields.");
    }

    // Student
    $studentStmt = $pdo->prepare("
        SELECT student_id, full_name, credit_balance
        FROM student
        WHERE student_id = :student_id
        LIMIT 1
    ");
    $studentStmt->execute([':student_id' => $studentId]);
    $student = $studentStmt->fetch();

    if (!$student) {
        throw new Exception("Student not found.");
    }

    if ((float)$student['credit_balance'] < RIDE_PRICE) {
        throw new Exception("Insufficient credits.");
    }

    // Bus
    $busStmt = $pdo->prepare("
        SELECT id, bus_number, capacity, booked_seats
        FROM buses
        WHERE id = :bus_id AND is_active = 1
        LIMIT 1
    ");
    $busStmt->execute([':bus_id' => $busId]);
    $bus = $busStmt->fetch();

    if (!$bus) {
        throw new Exception("Bus not found.");
    }

    if ((int)$bus['booked_seats'] >= (int)$bus['capacity']) {
        throw new Exception("This bus is full.");
    }

    // prevent duplicate booking for same bus/day
    $checkStmt = $pdo->prepare("
        SELECT id
        FROM bookings
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

    // Insert booking
    $insertBookingStmt = $pdo->prepare("
        INSERT INTO bookings (student_id, bus_id, booking_day)
        VALUES (:student_id, :bus_id, :booking_day)
    ");
    $insertBookingStmt->execute([
        ':student_id' => $studentId,
        ':bus_id' => $busId,
        ':booking_day' => $bookingDay
    ]);

    // Increase booked seats
    $updateBusStmt = $pdo->prepare("
        UPDATE buses
        SET booked_seats = booked_seats + 1
        WHERE id = :bus_id
    ");
    $updateBusStmt->execute([':bus_id' => $busId]);

    // Deduct credits
    $updateStudentStmt = $pdo->prepare("
        UPDATE student
        SET credit_balance = credit_balance - :ride_price
        WHERE student_id = :student_id
    ");
    $updateStudentStmt->execute([
        ':ride_price' => RIDE_PRICE,
        ':student_id' => $studentId
    ]);

    // Insert transaction
    $transactionStmt = $pdo->prepare("
        INSERT INTO transactions (student_id, type, title, amount, description)
        VALUES (:student_id, :type, :title, :amount, :description)
    ");
    $transactionStmt->execute([
        ':student_id' => $studentId,
        ':type' => 'ride_payment',
        ':title' => 'Bus Ride Payment',
        ':amount' => -RIDE_PRICE,
        ':description' => 'Booked seat on ' . $bus['bus_number'] . ' for ' . $bookingDay
    ]);

    $pdo->commit();

    // Return updated balance
    $newBalanceStmt = $pdo->prepare("
        SELECT credit_balance
        FROM student
        WHERE student_id = :student_id
        LIMIT 1
    ");
    $newBalanceStmt->execute([':student_id' => $studentId]);
    $updatedStudent = $newBalanceStmt->fetch();

    echo json_encode([
        "success" => true,
        "message" => "Booking successful.",
        "new_balance" => $updatedStudent ? $updatedStudent['credit_balance'] : null
    ]);

} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}