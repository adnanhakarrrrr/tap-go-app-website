-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 17, 2026 at 12:53 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tapandgo_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `full_name`, `email`, `password`) VALUES
(1, 'Main Admin', 'admin@tapandgo.com', '123456');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `bus_id` int(11) NOT NULL,
  `booking_day` enum('Today','Tomorrow','Saturday','Sunday') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `student_id`, `bus_id`, `booking_day`, `created_at`) VALUES
(1, 1, 3, 'Today', '2026-04-15 22:56:03');

-- --------------------------------------------------------

--
-- Table structure for table `buses`
--

CREATE TABLE `buses` (
  `id` int(11) NOT NULL,
  `bus_number` varchar(50) NOT NULL,
  `driver_name` varchar(100) NOT NULL,
  `driver_phone` varchar(30) NOT NULL,
  `capacity` int(11) NOT NULL DEFAULT 30,
  `booked_seats` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `route_name` varchar(255) NOT NULL,
  `available_day` enum('Today','Tomorrow','Saturday','Sunday') NOT NULL,
  `current_latitude` decimal(10,7) NOT NULL,
  `current_longitude` decimal(10,7) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `buses`
--

INSERT INTO `buses` (`id`, `bus_number`, `driver_name`, `driver_phone`, `capacity`, `booked_seats`, `is_active`, `route_name`, `available_day`, `current_latitude`, `current_longitude`) VALUES
(1, 'BUS-101', 'Ali Hassan', '03 123 456', 33, 22, 1, 'Campus → Hamra → Downtown', 'Today', 33.8938000, 35.5018000),
(2, 'BUS-204', 'Omar Khaled', '71 222 333', 33, 33, 1, 'Campus → Cola → Airport Road', 'Today', 33.8866000, 35.4954000),
(3, 'BUS-315', 'Hadi Nasser', '70 444 555', 30, 17, 1, 'Campus → Verdun → Raouche', 'Today', 33.8899000, 35.4838000);

-- --------------------------------------------------------

--
-- Table structure for table `driver`
--

CREATE TABLE `driver` (
  `driver_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `license_number` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `driver`
--

INSERT INTO `driver` (`driver_id`, `full_name`, `phone`, `license_number`) VALUES
(1, 'Ali Hassan', '03123456', 'LIC001'),
(2, 'Omar Khaled', '03234567', 'LIC002');

-- --------------------------------------------------------

--
-- Table structure for table `expense`
--

CREATE TABLE `expense` (
  `expense_id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `expense_type` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `expense_date` datetime NOT NULL DEFAULT current_timestamp(),
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `route_points`
--

CREATE TABLE `route_points` (
  `id` int(11) NOT NULL,
  `bus_id` int(11) NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `point_order` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `route_points`
--

INSERT INTO `route_points` (`id`, `bus_id`, `latitude`, `longitude`, `point_order`) VALUES
(1, 1, 33.8925000, 35.4985000, 1),
(2, 1, 33.8938000, 35.5018000, 2),
(3, 1, 33.8954000, 35.5074000, 3),
(4, 1, 33.8972000, 35.5124000, 4),
(5, 2, 33.8925000, 35.4985000, 1),
(6, 2, 33.8907000, 35.4948000, 2),
(7, 2, 33.8889000, 35.4909000, 3),
(8, 2, 33.8866000, 35.4954000, 4),
(9, 3, 33.8925000, 35.4985000, 1),
(10, 3, 33.8910000, 35.4925000, 2),
(11, 3, 33.8901000, 35.4875000, 3),
(12, 3, 33.8899000, 35.4838000, 4);

-- --------------------------------------------------------

--
-- Table structure for table `stops`
--

CREATE TABLE `stops` (
  `id` int(11) NOT NULL,
  `bus_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `stop_order` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stops`
--

INSERT INTO `stops` (`id`, `bus_id`, `name`, `latitude`, `longitude`, `stop_order`) VALUES
(1, 1, 'Campus Gate', 33.8925000, 35.4985000, 1),
(2, 1, 'Bliss Stop', 33.8938000, 35.5018000, 2),
(3, 1, 'Hamra Main', 33.8954000, 35.5074000, 3),
(4, 1, 'Downtown', 33.8972000, 35.5124000, 4),
(5, 2, 'Campus Gate', 33.8925000, 35.4985000, 1),
(6, 2, 'Cola Bridge', 33.8907000, 35.4948000, 2),
(7, 2, 'Sabra Stop', 33.8889000, 35.4909000, 3),
(8, 2, 'Airport Road', 33.8866000, 35.4954000, 4),
(9, 3, 'Campus Gate', 33.8925000, 35.4985000, 1),
(10, 3, 'Verdun', 33.8910000, 35.4925000, 2),
(11, 3, 'Ain El Tineh', 33.8901000, 35.4875000, 3),
(12, 3, 'Raouche', 33.8899000, 35.4838000, 4);

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `student_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `credit_balance` decimal(10,2) DEFAULT 0.00,
  `card_id` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`student_id`, `full_name`, `email`, `password`, `phone`, `credit_balance`, `card_id`) VALUES
(1, 'Adnan Mawass', 'adnan@example.com', '123456', '71000000', 10.00, 'CARD001'),
(2, 'Zawad Rachid', 'zawad@example.com', 'abcdef', '71111111', 8.00, 'CARD002');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bus_id` (`bus_id`);

--
-- Indexes for table `buses`
--
ALTER TABLE `buses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `driver`
--
ALTER TABLE `driver`
  ADD PRIMARY KEY (`driver_id`),
  ADD UNIQUE KEY `license_number` (`license_number`);

--
-- Indexes for table `expense`
--
ALTER TABLE `expense`
  ADD PRIMARY KEY (`expense_id`),
  ADD KEY `fk_expense_admin` (`admin_id`);

--
-- Indexes for table `route_points`
--
ALTER TABLE `route_points`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bus_id` (`bus_id`);

--
-- Indexes for table `stops`
--
ALTER TABLE `stops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bus_id` (`bus_id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `card_id` (`card_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `buses`
--
ALTER TABLE `buses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `driver`
--
ALTER TABLE `driver`
  MODIFY `driver_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `expense`
--
ALTER TABLE `expense`
  MODIFY `expense_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `route_points`
--
ALTER TABLE `route_points`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `stops`
--
ALTER TABLE `stops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expense`
--
ALTER TABLE `expense`
  ADD CONSTRAINT `fk_expense_admin` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`admin_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `route_points`
--
ALTER TABLE `route_points`
  ADD CONSTRAINT `route_points_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stops`
--
ALTER TABLE `stops`
  ADD CONSTRAINT `stops_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
