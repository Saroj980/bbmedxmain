-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 20, 2026 at 04:23 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bbmedx_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('asset','liability','equity','income','expense') NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `opening_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `opening_balance_type` enum('dr','cr') NOT NULL DEFAULT 'dr',
  `currency` varchar(10) NOT NULL DEFAULT 'NPR',
  `can_receive_payment` tinyint(1) NOT NULL DEFAULT 0,
  `can_make_payment` tinyint(1) NOT NULL DEFAULT 0,
  `is_system` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `code`, `name`, `type`, `category`, `parent_id`, `opening_balance`, `opening_balance_type`, `currency`, `can_receive_payment`, `can_make_payment`, `is_system`, `is_active`, `created_at`, `updated_at`) VALUES
(1, '1000', 'Assets', 'asset', NULL, NULL, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-18 09:23:33'),
(2, '1100', 'Current Assets', 'asset', NULL, 1, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-18 09:23:33'),
(3, '1110', 'Cash in Hand', 'asset', 'cash', 2, 40000.00, 'dr', 'NPR', 1, 1, 0, 1, '2025-12-18 09:23:33', '2026-03-06 08:26:56'),
(4, '1120', 'Bank Account', 'asset', 'bank', 2, 0.00, 'dr', 'NPR', 1, 1, 0, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(5, '1130', 'Mobile Wallets', 'asset', 'wallet', 2, 0.00, 'dr', 'NPR', 1, 1, 0, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(6, '1200', 'Accounts Receivable', 'asset', 'accounts_receivable', 2, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(7, '1300', 'Inventory', 'asset', 'inventory', 2, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(8, '1310', 'Medicine Inventory', 'asset', 'inventory', 6, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(9, '1320', 'Medical Supplies Inventory', 'asset', 'inventory', 6, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(10, '1330', 'Expired / Damaged Stock', 'asset', 'inventory', 6, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(11, '1400', 'Prepaid Expenses', 'asset', NULL, 2, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:23:33', '2025-12-18 09:23:33'),
(12, '2000', 'Liabilities', 'liability', NULL, NULL, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-18 09:23:33'),
(13, '2100', 'Accounts Payable', 'liability', 'account_payable', 12, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:23:33', '2025-12-28 06:26:11'),
(14, '2110', 'Supplier Payables', 'liability', 'supplier', 13, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(15, '2200', 'VAT Payable', 'liability', 'tax', 12, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(16, '2210', 'Output VAT', 'liability', 'tax', 15, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(17, '2220', 'Input VAT', 'liability', 'tax', 15, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(18, '2300', 'Accrued Expenses', 'liability', NULL, 12, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:23:33', '2025-12-18 09:23:33'),
(19, '3000', 'Equity', 'equity', 'equity', NULL, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(20, '3100', 'Capital', 'equity', 'equity', 19, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(21, '3200', 'Retained Earnings', 'equity', 'equity', 19, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(22, '3300', 'Opening Balance Adjustment', 'equity', 'equity', 19, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(23, '4000', 'Income', 'income', 'income', NULL, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(24, '4100', 'Medicine Sales', 'income', 'income', 23, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(25, '4110', 'Prescription Sales', 'income', 'income', 23, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(26, '4200', 'Service Income', 'income', 'income', 23, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(27, '4300', 'Sales Return', 'income', 'income', 23, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:23:33', '2025-12-28 06:23:48'),
(28, '5000', 'Cost of Goods Sold', 'expense', 'expense', NULL, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:27:13', '2025-12-28 06:24:45'),
(29, '5100', 'Medicine Purchase Cost', 'expense', 'expense', 28, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:28:22', '2025-12-28 06:24:45'),
(30, '5110', 'Purchase Return', 'expense', 'expense', 28, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:28:22', '2025-12-28 06:24:45'),
(31, '5120', 'Inventory Adjustment', 'expense', 'expense', 28, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:28:22', '2025-12-28 06:24:45'),
(32, '6000', 'Operating Expenses', 'expense', 'expense', NULL, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:29:10', '2025-12-28 06:24:45'),
(33, '6100', 'Salary Expense', 'expense', 'expense', 32, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:29:21', '2025-12-28 06:24:45'),
(34, '6200', 'Rent Expense', 'expense', 'expense', 32, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:29:21', '2025-12-28 06:24:45'),
(35, '6300', 'Utility Expense', 'expense', 'expense', 32, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:29:21', '2025-12-28 06:24:45'),
(36, '6400', 'Transportation Expense', 'expense', 'expense', 32, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:29:21', '2025-12-28 06:24:45'),
(37, '6500', 'Discount Allowed', 'expense', 'expense', 32, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-18 09:29:21', '2025-12-28 06:24:45'),
(38, '6600', 'Expired Medicine Loss', 'expense', 'expense', 32, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:29:21', '2025-12-28 06:24:45'),
(39, '9000', 'System Accounts', 'asset', NULL, NULL, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:29:44', '2025-12-18 09:29:44'),
(40, '9100', 'Inventory Control Account', 'asset', 'inventory', 39, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:30:03', '2025-12-28 06:23:48'),
(41, '9200', 'Rounding Adjustment', 'expense', 'expense', 39, 0.00, 'dr', 'NPR', 0, 0, 1, 1, '2025-12-18 09:30:03', '2025-12-28 06:24:45'),
(42, '1200-4', 'LifeCare Medical Traders', 'asset', NULL, 6, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-23 03:18:10', '2025-12-28 06:14:27'),
(43, '2110-1', 'Saroj Suppliers Pvt. Ltd.', 'liability', 'supplier', 14, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-23 03:20:11', '2025-12-28 06:27:10'),
(44, '1200-5', 'Sunrise Pharma Traders', 'asset', NULL, 6, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-23 03:40:34', '2025-12-28 06:14:46'),
(45, '2110-2', 'Himalayan Drug Distributors', 'liability', 'supplier', 14, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-23 03:57:12', '2025-12-28 06:27:10'),
(46, '1200-6', 'National Medical Store', 'asset', NULL, 6, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-23 03:57:35', '2025-12-28 06:15:11'),
(47, '2110-3', 'City Medico Suppliers', 'liability', 'supplier', 14, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-24 03:00:10', '2025-12-28 06:27:10'),
(48, '1200-7', 'City Pharmacy', 'asset', NULL, 6, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-28 00:11:34', '2025-12-28 00:11:34'),
(49, '1200-8', 'New Life Pharmacy', 'asset', NULL, 6, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-28 00:11:48', '2025-12-28 00:11:48'),
(50, '1200-9', 'CarePoint Pharmacy', 'asset', NULL, 6, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-28 00:12:05', '2025-12-28 00:12:05'),
(51, '1200-10', 'MediPlus Pharmacy', 'asset', NULL, 6, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-28 00:12:22', '2025-12-28 00:12:22'),
(52, '1200-11', 'Urban Health Store', 'asset', NULL, 6, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-28 00:12:35', '2025-12-28 00:12:35'),
(53, '1200-12', 'Shree Medical Hall', 'asset', NULL, 6, 0.00, 'dr', 'NPR', 0, 0, 0, 1, '2025-12-28 00:12:52', '2025-12-28 00:12:52'),
(56, '1120-1', 'Global IME Bank', 'asset', 'bank', 4, 15000.00, 'dr', 'NPR', 1, 1, 0, 1, '2025-12-28 02:47:38', '2026-03-06 12:26:39'),
(57, '1120-2', 'Laxmi Sunrise Bank', 'asset', 'bank', 4, 25000.00, 'dr', 'NPR', 1, 1, 0, 1, '2025-12-28 02:49:27', '2026-03-06 08:50:22'),
(58, '1130-1', 'Esewa', 'asset', 'wallet', 5, 0.00, 'dr', 'NPR', 1, 1, 0, 1, '2025-12-28 02:49:43', '2025-12-28 10:06:36'),
(59, '1130-2', 'Khalti', 'asset', 'wallet', 5, 0.00, 'dr', 'NPR', 1, 1, 0, 1, '2025-12-28 02:49:51', '2025-12-28 07:21:40');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dictionary_categories`
--

CREATE TABLE `dictionary_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `label` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dictionary_categories`
--

INSERT INTO `dictionary_categories` (`id`, `name`, `label`, `created_at`, `updated_at`) VALUES
(1, 'manufacturer_name', 'Manufacturer', NULL, NULL),
(2, 'brand_name', 'Brand', NULL, NULL),
(3, 'generic_name', 'Generic', NULL, NULL),
(4, 'dosage_form', 'Dosage Form', NULL, NULL),
(5, 'leaf_type', 'Leaf Type', '2025-12-13 03:27:36', '2025-12-13 03:27:36'),
(7, 'strength', 'Strength', '2025-12-14 07:57:00', '2025-12-14 07:57:00');

-- --------------------------------------------------------

--
-- Table structure for table `dictionary_items`
--

CREATE TABLE `dictionary_items` (
  `id` int(11) NOT NULL,
  `type` text NOT NULL,
  `value` text NOT NULL,
  `slug` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dictionary_values`
--

CREATE TABLE `dictionary_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `value` varchar(255) NOT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dictionary_values`
--

INSERT INTO `dictionary_values` (`id`, `category_id`, `value`, `meta`, `created_at`, `updated_at`) VALUES
(3, 2, 'Crocin', NULL, '2025-12-11 08:04:25', '2025-12-11 08:04:25'),
(5, 3, 'Paracetamol', NULL, '2025-12-11 08:04:25', '2025-12-11 08:04:25'),
(12, 2, 'Frocon', NULL, '2025-12-13 02:55:19', '2025-12-13 02:55:19'),
(14, 4, 'Tablet', NULL, '2025-12-13 03:22:37', '2025-12-13 03:22:37'),
(15, 4, 'Capsule', NULL, '2025-12-13 03:22:51', '2025-12-13 03:22:51'),
(16, 4, 'Syrup', NULL, '2025-12-13 03:23:00', '2025-12-13 03:23:00'),
(17, 4, 'Injection', NULL, '2025-12-13 03:23:10', '2025-12-13 03:23:10'),
(18, 4, 'Ointment', NULL, '2025-12-13 03:23:22', '2025-12-13 03:23:22'),
(19, 4, 'Drops', NULL, '2025-12-13 03:23:39', '2025-12-13 03:23:39'),
(20, 1, 'Nepal Pharmaceuticals Laboratory Pvt. Ltd. (NPL)', NULL, '2025-12-13 03:43:53', '2025-12-13 03:43:53'),
(21, 1, 'Deurali-Janta Pharmaceuticals Pvt. Ltd.', NULL, '2025-12-13 03:44:00', '2025-12-13 03:44:00'),
(22, 1, 'Lomus Pharmaceuticals Pvt. Ltd.', NULL, '2025-12-13 03:44:07', '2025-12-13 03:44:07'),
(23, 1, 'Elder Universal Pharmaceuticals', NULL, '2025-12-13 03:44:15', '2025-12-13 03:44:15'),
(24, 1, 'Quest Pharmaceuticals Pvt. Ltd.', NULL, '2025-12-13 03:44:22', '2025-12-13 03:44:22'),
(25, 1, 'National Healthcare Pvt. Ltd.', NULL, '2025-12-13 03:44:29', '2025-12-13 03:44:29'),
(26, 1, 'Asian Pharmaceuticals Pvt. Ltd.', NULL, '2025-12-13 03:44:41', '2025-12-13 03:44:41'),
(27, 1, 'Intas Pharmaceuticals', NULL, '2025-12-13 03:45:26', '2025-12-13 03:45:26'),
(28, 1, 'Emcure Pharmaceuticals', NULL, '2025-12-13 03:45:37', '2025-12-13 03:45:37'),
(29, 1, 'Sun Pharmaceutical Industries', NULL, '2025-12-13 03:45:45', '2025-12-13 03:45:45'),
(30, 1, 'Ipca Laboratories', NULL, '2025-12-13 03:45:59', '2025-12-13 03:45:59'),
(31, 5, '1X1', NULL, '2025-12-13 03:46:22', '2025-12-13 03:46:22'),
(32, 5, '1X2', NULL, '2025-12-13 03:46:33', '2025-12-13 03:46:33'),
(33, 5, '1X3', NULL, '2025-12-13 03:46:50', '2025-12-13 03:46:50'),
(34, 5, '1X5', NULL, '2025-12-13 03:46:55', '2025-12-13 03:46:55'),
(35, 5, '1X10', NULL, '2025-12-13 03:47:20', '2025-12-13 03:47:20'),
(36, 7, '50 mg', NULL, '2025-12-14 08:03:07', '2025-12-14 08:03:07'),
(37, 7, '100 mg', NULL, '2025-12-14 08:03:13', '2025-12-14 08:03:13'),
(38, 7, '500 mg', NULL, '2025-12-14 08:03:18', '2025-12-14 08:03:18'),
(39, 2, 'Cetmol', NULL, '2025-12-15 00:41:21', '2025-12-15 00:41:21'),
(40, 2, 'Pyremol', NULL, '2025-12-15 00:41:28', '2025-12-15 00:41:28'),
(41, 2, 'Napa', NULL, '2025-12-15 00:41:32', '2025-12-15 00:41:32'),
(42, 2, 'Paramol', NULL, '2025-12-15 00:41:38', '2025-12-15 00:41:38'),
(43, 5, '2X5', NULL, '2025-12-15 23:56:52', '2025-12-15 23:56:52'),
(44, 7, '10 mg', NULL, '2025-12-16 00:13:36', '2025-12-16 00:13:36'),
(46, 3, 'Ibuprofen', NULL, '2025-12-17 09:24:54', '2025-12-17 09:24:54'),
(47, 2, 'Paracet Plus', NULL, '2025-12-18 02:43:31', '2025-12-18 02:43:31'),
(48, 3, 'Amoxicillin', NULL, '2025-12-18 02:59:30', '2025-12-18 02:59:30'),
(49, 2, 'Moxikind', NULL, '2025-12-18 02:59:37', '2025-12-18 02:59:37'),
(50, 1, 'Mankind Pharma', NULL, '2025-12-18 02:59:45', '2025-12-18 02:59:45'),
(51, 2, 'Panadol', NULL, '2025-12-28 03:34:57', '2025-12-28 03:34:57'),
(52, 1, 'GSK', NULL, '2025-12-28 03:35:04', '2025-12-28 03:35:04'),
(53, 2, 'Calpol', NULL, '2025-12-28 03:36:20', '2025-12-28 03:36:20'),
(54, 1, 'Cipla', NULL, '2025-12-28 03:36:33', '2025-12-28 03:36:33'),
(55, 7, '650 mg', NULL, '2025-12-28 03:36:45', '2025-12-28 03:36:45'),
(56, 2, 'Brufen', NULL, '2025-12-28 03:38:00', '2025-12-28 03:38:00'),
(57, 1, 'Abbott', NULL, '2025-12-28 03:38:09', '2025-12-28 03:38:09'),
(58, 7, '400 mg', NULL, '2025-12-28 03:38:17', '2025-12-28 03:38:17'),
(59, 3, 'Cetirizine', NULL, '2025-12-28 03:39:59', '2025-12-28 03:39:59'),
(60, 2, 'Cetzine', NULL, '2025-12-28 03:40:06', '2025-12-28 03:40:06'),
(61, 3, 'Pantoprazole', NULL, '2025-12-28 03:41:49', '2025-12-28 03:41:49'),
(62, 2, 'Pantocid', NULL, '2025-12-28 03:41:56', '2025-12-28 03:41:56'),
(63, 7, '40 mg', NULL, '2025-12-28 03:42:12', '2025-12-28 03:42:12'),
(64, 3, 'Multivitamins', NULL, '2025-12-28 03:43:06', '2025-12-28 03:43:06'),
(65, 2, 'Zincovit', NULL, '2025-12-28 03:43:13', '2025-12-28 03:43:13'),
(66, 1, 'Apex', NULL, '2025-12-28 03:43:20', '2025-12-28 03:43:20'),
(67, 2, 'Amoxil', NULL, '2025-12-28 03:44:00', '2025-12-28 03:44:00'),
(68, 7, '250 mg', NULL, '2025-12-28 03:44:21', '2025-12-28 03:44:21'),
(69, 3, 'Doxycycline', NULL, '2025-12-28 03:45:02', '2025-12-28 03:45:02'),
(70, 2, 'Doxicip', NULL, '2025-12-28 03:45:09', '2025-12-28 03:45:09'),
(71, 7, '125 mg / 5 ml', NULL, '2025-12-28 03:46:17', '2025-12-28 03:46:17'),
(72, 5, 'Liquid', NULL, '2025-12-28 03:46:39', '2025-12-28 03:46:39'),
(73, 2, 'Benadryl', NULL, '2025-12-28 03:47:50', '2025-12-28 03:47:50'),
(74, 3, 'Diphenhydramine', NULL, '2025-12-28 03:47:57', '2025-12-28 03:47:57'),
(75, 1, 'J&J', NULL, '2025-12-28 03:48:04', '2025-12-28 03:48:04'),
(76, 7, '100 ml', NULL, '2025-12-28 03:48:15', '2025-12-28 03:48:15'),
(77, 2, 'Rocephin', NULL, '2025-12-28 03:48:49', '2025-12-28 03:48:49'),
(78, 3, 'Ceftriaxone', NULL, '2025-12-28 03:49:03', '2025-12-28 03:49:03'),
(79, 1, 'Roche', NULL, '2025-12-28 03:49:10', '2025-12-28 03:49:10'),
(80, 7, '1 g', NULL, '2025-12-28 03:49:28', '2025-12-28 03:49:28'),
(81, 2, 'Candid', NULL, '2025-12-28 03:50:48', '2025-12-28 03:50:48'),
(82, 3, 'Clotrimazole', NULL, '2025-12-28 03:50:54', '2025-12-28 03:50:54'),
(83, 1, 'Glenmark', NULL, '2025-12-28 03:51:03', '2025-12-28 03:51:03'),
(84, 7, '1 %', NULL, '2025-12-28 03:51:12', '2025-12-28 03:51:12'),
(85, 2, 'Pampers', NULL, '2025-12-28 03:53:40', '2025-12-28 03:53:40'),
(86, 3, 'Baby Diaper', NULL, '2025-12-28 03:53:46', '2025-12-28 03:53:46'),
(87, 1, 'P&G', NULL, '2025-12-28 03:53:57', '2025-12-28 03:53:57'),
(88, 2, 'Johnson', NULL, '2025-12-28 03:54:56', '2025-12-28 03:54:56'),
(89, 3, 'Mineral Oil', NULL, '2025-12-28 03:55:03', '2025-12-28 03:55:03'),
(90, 2, 'Surgicare', NULL, '2025-12-28 03:55:37', '2025-12-28 03:55:37'),
(91, 3, 'Latex Gloves', NULL, '2025-12-28 03:55:47', '2025-12-28 03:55:47'),
(92, 1, 'Surgicare', NULL, '2025-12-28 03:56:03', '2025-12-28 03:56:03'),
(93, 2, 'Dr. Morepen', NULL, '2025-12-28 03:56:31', '2025-12-28 03:56:31'),
(94, 3, 'Thermometer', NULL, '2025-12-28 03:56:36', '2025-12-28 03:56:36'),
(95, 1, 'Morepen', NULL, '2025-12-28 03:56:44', '2025-12-28 03:56:44'),
(96, 2, '3M', NULL, '2025-12-28 03:57:24', '2025-12-28 03:57:24'),
(97, 3, 'Respirator Mask', NULL, '2025-12-28 03:57:31', '2025-12-28 03:57:31'),
(98, 1, '3M', NULL, '2025-12-28 03:57:40', '2025-12-28 03:57:40'),
(99, 3, '-', NULL, '2026-03-05 07:35:59', '2026-03-05 07:35:59'),
(100, 2, '-', NULL, '2026-03-05 07:36:06', '2026-03-05 07:36:06'),
(101, 1, '-', NULL, '2026-03-05 07:36:12', '2026-03-05 07:36:12'),
(102, 7, '-', NULL, '2026-03-05 07:36:17', '2026-03-05 07:36:17'),
(103, 2, 'Mox', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(104, 7, '500mg', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(105, 2, 'Azith', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(106, 3, 'Azithromycin', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(107, 2, 'Cipro', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(108, 3, 'Ciprofloxacin', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(109, 2, 'Cef-O', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(110, 3, 'Cefixime', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(111, 7, '200mg', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(112, 2, 'Metrogyl', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(113, 3, 'Metronidazole', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(114, 7, '400mg', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(115, 2, 'Nimulid', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(116, 3, 'Nimesulide', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(117, 7, '100mg', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(118, 2, 'Flexon', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(119, 3, 'Ibuprofen + Paracetamol', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(120, 7, 'Standard', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(121, 2, 'Voveran', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(122, 3, 'Diclofenac Sodium', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(123, 7, '1% w/w', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(124, 2, 'Montair', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(125, 3, 'Montelukast Sodium', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(126, 7, '10mg', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(127, 2, 'Asthalin', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(128, 3, 'Salbutamol', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(129, 7, '100mcg', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(130, 2, 'Levocet', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(131, 3, 'Levocetirizine Dihydrochloride', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(132, 7, '5mg', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(133, 2, 'Okacet', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(134, 3, 'Cetirizine Hydrochloride', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(135, 2, 'Ascoril', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(136, 3, 'Terbutaline + Bromhexine', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(137, 7, '100ml', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(138, 2, 'Limcee', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(139, 3, 'Vitamin C', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(140, 2, 'Calcirol', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(141, 3, 'Cholecalciferol', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(142, 7, '60000 IU', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(143, 2, 'Shelcal', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(144, 3, 'Calcium + Vitamin D3', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(145, 2, 'Revital H', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(146, 3, 'Multivitamins + Ginseng', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(147, 2, 'Becosules Z', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(148, 3, 'B-Complex + Zinc', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(149, 2, 'Dispovan', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(150, 3, 'Syringe', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(151, 7, '5ml', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(152, 3, 'Gloves', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(153, 7, 'Size 7', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(154, 2, 'HealthCare', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(155, 3, 'Mask', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(156, 7, '3-Ply', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(157, 2, 'Crepe', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(158, 3, 'Bandage', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(159, 7, '4 Inch', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(160, 2, 'Jelco', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(161, 3, 'Cannula', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(162, 7, '20G', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(163, 7, '40mg', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(164, 2, 'Omez', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(165, 3, 'Omeprazole', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(166, 7, '20mg', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(167, 2, 'Digene', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(168, 3, 'Antacid', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(169, 7, '200ml', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(170, 2, 'Jeevan Jal', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(171, 3, 'Oral Rehydration Salts', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(172, 2, 'Domstal', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(173, 3, 'Domperidone', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(174, 2, 'Amlovas', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(175, 3, 'Amlodipine Besylate', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(176, 2, 'Atorva', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(177, 3, 'Atorvastatin', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(178, 2, 'Telma', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(179, 3, 'Telmisartan', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(180, 2, 'Betadine', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(181, 3, 'Povidone-Iodine', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(182, 7, '5% w/w', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(183, 2, 'Dettol', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(184, 3, 'Chloroxylenol', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(185, 7, '500ml', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(186, 3, 'Diaper', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(187, 7, 'Medium (M)', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(188, 2, 'Omron HEM-7120', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(189, 3, 'Blood Pressure Monitor', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(190, 7, 'Digital', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(191, 2, 'Rossmax', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(192, 3, 'Nebulizer', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(193, 7, 'Heavy Duty', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(194, 2, 'Accu-Chek', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(195, 3, 'Glucose Test Strips', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(196, 7, '50 Strips', NULL, '2026-03-05 15:33:01', '2026-03-05 15:33:01'),
(197, 3, 'Indomethacin', NULL, '2026-03-28 04:18:08', '2026-03-28 04:18:08'),
(198, 2, 'Indol - 50', NULL, '2026-03-28 04:18:52', '2026-03-28 04:18:52'),
(199, 1, 'Leben Laborataries Pvt. Ltd.', NULL, '2026-03-28 04:19:09', '2026-03-28 04:19:09');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fiscal_years`
--

CREATE TABLE `fiscal_years` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(20) NOT NULL,
  `bs_start` varchar(10) NOT NULL,
  `bs_end` varchar(10) NOT NULL,
  `ad_start` date NOT NULL,
  `ad_end` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `is_locked` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `fiscal_years`
--

INSERT INTO `fiscal_years` (`id`, `name`, `bs_start`, `bs_end`, `ad_start`, `ad_end`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
(1, '2082/83', '2082-04-01', '2083-03-32', '2025-07-13', '2026-07-16', 1, 0, '2026-01-13 09:46:36', '2026-03-25 06:02:59'),
(2, '2081/82', '2081-04-01', '2082-03-32', '2024-07-16', '2025-07-16', 0, 0, '2026-03-06 06:47:04', '2026-03-25 06:02:59');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_account_mappings`
--

CREATE TABLE `inventory_account_mappings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `movement_type` varchar(50) NOT NULL,
  `debit_account_code` varchar(20) NOT NULL,
  `credit_account_code` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_account_mappings`
--

INSERT INTO `inventory_account_mappings` (`id`, `movement_type`, `debit_account_code`, `credit_account_code`, `created_at`) VALUES
(1, 'opening', '1310', '3300', '2025-12-18 09:24:45'),
(2, 'purchase', '1310', '2110', '2025-12-18 09:24:45'),
(3, 'sale', '5100', '1310', '2025-12-18 09:24:45'),
(4, 'expiry', '6600', '1310', '2025-12-18 09:24:45'),
(5, 'adjustment', '5120', '1310', '2025-12-18 09:24:45');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journals`
--

CREATE TABLE `journals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `journal_no` varchar(50) DEFAULT NULL,
  `journal_date` date NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `posted` tinyint(1) DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `journals`
--

INSERT INTO `journals` (`id`, `journal_no`, `journal_date`, `reference_type`, `reference_id`, `description`, `posted`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'PUR-20260306132826', '2026-03-06', 'App\\Models\\Purchase', 1, 'Purchase Invoice PUR-202603-000001', 1, 2, '2026-03-06 07:43:26', '2026-03-06 07:43:26'),
(2, 'OPEN-20260306141156', '2026-03-06', 'App\\Models\\Account', 3, 'Opening Balance - Cash in Hand', 1, 1, '2026-03-06 08:26:56', '2026-03-06 08:26:56'),
(3, 'OPEN-2026030614352238', '2026-03-06', 'App\\Models\\Account', 56, 'Opening Balance Adjustment - Global IME Bank', 1, 2, '2026-03-06 08:50:22', '2026-03-06 08:50:22'),
(4, 'OPEN-2026030614352270', '2026-03-06', 'App\\Models\\Account', 57, 'Opening Balance Adjustment - Laxmi Sunrise Bank', 1, 2, '2026-03-06 08:50:22', '2026-03-06 08:50:22'),
(5, 'PAY-000001', '2026-03-06', NULL, NULL, 'Payment #1', 1, 2, '2026-03-06 10:30:00', '2026-03-06 10:30:00'),
(6, 'PAY-000002', '2026-03-06', NULL, NULL, 'Payment to CarePoint Pharmacy', 1, 2, '2026-03-06 10:33:59', '2026-03-06 10:33:59'),
(7, 'RCV-000001', '2026-03-06', NULL, NULL, 'Received from CarePoint Pharmacy', 1, 2, '2026-03-06 10:34:28', '2026-03-06 10:34:28'),
(8, 'REV-2026030618113940', '2026-03-06', 'App\\Models\\Account', 56, 'Opening Balance Reversal - Global IME Bank', 1, 2, '2026-03-06 12:26:39', '2026-03-06 12:26:39'),
(9, 'OPEN-2026030618113922', '2026-03-06', 'App\\Models\\Account', 56, 'Opening Balance Adjustment - Global IME Bank', 1, 2, '2026-03-06 12:26:39', '2026-03-06 12:26:39'),
(10, 'JV-000001', '2026-03-06', NULL, NULL, 'Cash Payment to New Life Pharmacy', 1, 2, '2026-03-06 12:52:57', '2026-03-06 12:52:57'),
(11, 'SAL-20260307094652', '2026-03-07', 'App\\Models\\Sale', 1, 'Sales Invoice SAL-202603-000001', 1, 2, '2026-03-07 04:01:52', '2026-03-07 04:01:52'),
(12, 'RCV-20260307094652', '2026-03-07', 'App\\Models\\SalePayment', 1, 'Payment for Sales Invoice SAL-202603-000001', 1, 2, '2026-03-07 04:01:52', '2026-03-07 04:01:52'),
(13, 'PUR-20260307112819', '2026-03-07', 'App\\Models\\Purchase', 2, 'Purchase Invoice PUR-202603-000002', 1, 2, '2026-03-07 05:43:19', '2026-03-07 05:43:19'),
(14, 'PAY-20260307112819', '2026-03-07', 'App\\Models\\PurchasePayment', 1, 'Purchase Payment PUR-202603-000002', 1, 2, '2026-03-07 05:43:19', '2026-03-07 05:43:19'),
(15, 'SAL-20260307133312', '2026-03-07', 'App\\Models\\Sale', 2, 'Sales Invoice SAL-202603-000002', 1, 2, '2026-03-07 07:48:12', '2026-03-07 07:48:12'),
(16, 'RCV-20260307133312', '2026-03-07', 'App\\Models\\SalePayment', 2, 'Payment for Sales Invoice SAL-202603-000002', 1, 2, '2026-03-07 07:48:12', '2026-03-07 07:48:12'),
(17, 'PUR-20260325114559', '2026-03-25', 'App\\Models\\Purchase', 3, 'Purchase Invoice PUR-202603-000003', 1, 2, '2026-03-25 06:00:59', '2026-03-25 06:00:59'),
(18, 'PAY-20260325114559', '2026-03-25', 'App\\Models\\PurchasePayment', 2, 'Purchase Payment PUR-202603-000003', 1, 2, '2026-03-25 06:00:59', '2026-03-25 06:00:59'),
(19, 'PUR-20260328100834', '2026-03-28', 'App\\Models\\Purchase', 4, 'Purchase Invoice PUR-202603-000004', 1, 2, '2026-03-28 04:23:34', '2026-03-28 04:23:34'),
(20, 'PAY-20260328100834', '2026-03-28', 'App\\Models\\PurchasePayment', 3, 'Purchase Payment PUR-202603-000004', 1, 2, '2026-03-28 04:23:34', '2026-03-28 04:23:34'),
(21, 'SAL-20260328101127', '2026-03-28', 'App\\Models\\Sale', 3, 'Sales Invoice SAL-202603-000003', 1, 2, '2026-03-28 04:26:27', '2026-03-28 04:26:27'),
(22, 'RCV-20260328101127', '2026-03-28', 'App\\Models\\SalePayment', 3, 'Payment for Sales Invoice SAL-202603-000003', 1, 2, '2026-03-28 04:26:27', '2026-03-28 04:26:27');

-- --------------------------------------------------------

--
-- Table structure for table `journal_entries`
--

CREATE TABLE `journal_entries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `journal_id` bigint(20) UNSIGNED NOT NULL,
  `account_id` bigint(20) UNSIGNED NOT NULL,
  `debit` decimal(15,2) DEFAULT 0.00,
  `credit` decimal(15,2) DEFAULT 0.00,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `party_id` bigint(20) UNSIGNED DEFAULT NULL
) ;

--
-- Dumping data for table `journal_entries`
--

INSERT INTO `journal_entries` (`id`, `journal_id`, `account_id`, `debit`, `credit`, `description`, `created_at`, `updated_at`, `party_id`) VALUES
(1, 1, 8, 11000.00, 0.00, NULL, '2026-03-06 07:43:26', '2026-03-06 07:43:26', NULL),
(2, 1, 17, 1430.00, 0.00, NULL, '2026-03-06 07:43:26', '2026-03-06 07:43:26', NULL),
(3, 1, 50, 0.00, 12430.00, NULL, '2026-03-06 07:43:26', '2026-03-06 07:43:26', 9),
(4, 2, 3, 40000.00, 0.00, NULL, '2026-03-06 08:26:56', '2026-03-06 08:26:56', NULL),
(5, 2, 19, 0.00, 40000.00, NULL, '2026-03-06 08:26:56', '2026-03-06 08:26:56', NULL),
(6, 3, 56, 10000.00, 0.00, NULL, '2026-03-06 08:50:22', '2026-03-06 08:50:22', NULL),
(7, 3, 19, 0.00, 10000.00, NULL, '2026-03-06 08:50:22', '2026-03-06 08:50:22', NULL),
(8, 4, 57, 25000.00, 0.00, NULL, '2026-03-06 08:50:22', '2026-03-06 08:50:22', NULL),
(9, 4, 19, 0.00, 25000.00, NULL, '2026-03-06 08:50:22', '2026-03-06 08:50:22', NULL),
(10, 5, 50, 5000.00, 0.00, NULL, '2026-03-06 10:30:00', '2026-03-06 10:30:00', NULL),
(11, 5, 3, 0.00, 5000.00, NULL, '2026-03-06 10:30:00', '2026-03-06 10:30:00', NULL),
(12, 6, 50, 200.00, 0.00, NULL, '2026-03-06 10:33:59', '2026-03-06 10:33:59', NULL),
(13, 6, 3, 0.00, 200.00, NULL, '2026-03-06 10:33:59', '2026-03-06 10:33:59', NULL),
(14, 7, 3, 500.00, 0.00, NULL, '2026-03-06 10:34:28', '2026-03-06 10:34:28', NULL),
(15, 7, 50, 0.00, 500.00, NULL, '2026-03-06 10:34:28', '2026-03-06 10:34:28', NULL),
(16, 8, 56, 0.00, 10000.00, NULL, '2026-03-06 12:26:39', '2026-03-06 12:26:39', NULL),
(17, 8, 19, 10000.00, 0.00, NULL, '2026-03-06 12:26:39', '2026-03-06 12:26:39', NULL),
(18, 9, 56, 15000.00, 0.00, NULL, '2026-03-06 12:26:39', '2026-03-06 12:26:39', NULL),
(19, 9, 19, 0.00, 15000.00, NULL, '2026-03-06 12:26:39', '2026-03-06 12:26:39', NULL),
(20, 10, 49, 5000.00, 0.00, NULL, '2026-03-06 12:52:57', '2026-03-06 12:52:57', NULL),
(21, 10, 3, 0.00, 5000.00, NULL, '2026-03-06 12:52:57', '2026-03-06 12:52:57', NULL),
(22, 11, 6, 2000.00, 0.00, NULL, '2026-03-07 04:01:52', '2026-03-07 04:01:52', 13),
(23, 11, 24, 0.00, 2400.00, NULL, '2026-03-07 04:01:52', '2026-03-07 04:01:52', NULL),
(24, 11, 16, 0.00, 312.00, NULL, '2026-03-07 04:01:52', '2026-03-07 04:01:52', NULL),
(25, 11, 37, 712.00, 0.00, NULL, '2026-03-07 04:01:52', '2026-03-07 04:01:52', NULL),
(26, 11, 29, 2100.00, 0.00, NULL, '2026-03-07 04:01:52', '2026-03-07 04:01:52', NULL),
(27, 11, 8, 0.00, 2100.00, NULL, '2026-03-07 04:01:52', '2026-03-07 04:01:52', NULL),
(28, 12, 3, 2000.00, 0.00, NULL, '2026-03-07 04:01:52', '2026-03-07 04:01:52', NULL),
(29, 12, 6, 0.00, 2000.00, NULL, '2026-03-07 04:01:52', '2026-03-07 04:01:52', 13),
(30, 13, 8, 5000.00, 0.00, NULL, '2026-03-07 05:43:19', '2026-03-07 05:43:19', NULL),
(31, 13, 17, 650.00, 0.00, NULL, '2026-03-07 05:43:19', '2026-03-07 05:43:19', NULL),
(32, 13, 47, 0.00, 5650.00, NULL, '2026-03-07 05:43:19', '2026-03-07 05:43:19', 6),
(33, 14, 47, 5000.00, 0.00, NULL, '2026-03-07 05:43:19', '2026-03-07 05:43:19', 6),
(34, 14, 56, 0.00, 5000.00, NULL, '2026-03-07 05:43:19', '2026-03-07 05:43:19', NULL),
(35, 15, 6, 628.00, 0.00, NULL, '2026-03-07 07:48:12', '2026-03-07 07:48:12', 13),
(36, 15, 24, 0.00, 560.00, NULL, '2026-03-07 07:48:12', '2026-03-07 07:48:12', NULL),
(37, 15, 16, 0.00, 72.80, NULL, '2026-03-07 07:48:12', '2026-03-07 07:48:12', NULL),
(38, 15, 37, 4.80, 0.00, NULL, '2026-03-07 07:48:12', '2026-03-07 07:48:12', NULL),
(39, 15, 29, 5050.00, 0.00, NULL, '2026-03-07 07:48:12', '2026-03-07 07:48:12', NULL),
(40, 15, 8, 0.00, 5050.00, NULL, '2026-03-07 07:48:12', '2026-03-07 07:48:12', NULL),
(41, 16, 3, 628.00, 0.00, NULL, '2026-03-07 07:48:12', '2026-03-07 07:48:12', NULL),
(42, 16, 6, 0.00, 628.00, NULL, '2026-03-07 07:48:12', '2026-03-07 07:48:12', 13),
(43, 17, 8, 750.00, 0.00, NULL, '2026-03-25 06:00:59', '2026-03-25 06:00:59', NULL),
(44, 17, 17, 97.50, 0.00, NULL, '2026-03-25 06:00:59', '2026-03-25 06:00:59', NULL),
(45, 17, 45, 0.00, 847.50, NULL, '2026-03-25 06:00:59', '2026-03-25 06:00:59', 4),
(46, 18, 45, 847.50, 0.00, NULL, '2026-03-25 06:00:59', '2026-03-25 06:00:59', 4),
(47, 18, 3, 0.00, 847.50, NULL, '2026-03-25 06:00:59', '2026-03-25 06:00:59', NULL),
(48, 19, 8, 3500.00, 0.00, NULL, '2026-03-28 04:23:34', '2026-03-28 04:23:34', NULL),
(49, 19, 17, 455.00, 0.00, NULL, '2026-03-28 04:23:34', '2026-03-28 04:23:34', NULL),
(50, 19, 53, 0.00, 3955.00, NULL, '2026-03-28 04:23:34', '2026-03-28 04:23:34', 12),
(51, 20, 53, 3955.00, 0.00, NULL, '2026-03-28 04:23:34', '2026-03-28 04:23:34', 12),
(52, 20, 3, 0.00, 3955.00, NULL, '2026-03-28 04:23:34', '2026-03-28 04:23:34', NULL),
(53, 21, 6, 70.00, 0.00, NULL, '2026-03-28 04:26:27', '2026-03-28 04:26:27', 13),
(54, 21, 24, 0.00, 70.00, NULL, '2026-03-28 04:26:27', '2026-03-28 04:26:27', NULL),
(55, 21, 16, 0.00, 9.10, NULL, '2026-03-28 04:26:27', '2026-03-28 04:26:27', NULL),
(56, 21, 37, 9.10, 0.00, NULL, '2026-03-28 04:26:27', '2026-03-28 04:26:27', NULL),
(57, 21, 29, 1750.00, 0.00, NULL, '2026-03-28 04:26:27', '2026-03-28 04:26:27', NULL),
(58, 21, 8, 0.00, 1750.00, NULL, '2026-03-28 04:26:27', '2026-03-28 04:26:27', NULL),
(59, 22, 3, 70.00, 0.00, NULL, '2026-03-28 04:26:27', '2026-03-28 04:26:27', NULL),
(60, 22, 6, 0.00, 70.00, NULL, '2026-03-28 04:26:27', '2026-03-28 04:26:27', 13);

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `level` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `name`, `parent_id`, `level`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'R-1', NULL, 1, 1, '2025-12-04 04:50:18', '2025-12-04 09:45:31'),
(2, '1-1', 1, 2, 1, '2025-12-04 04:50:27', '2025-12-04 04:50:27'),
(5, '1-2', 1, 2, 1, '2025-12-04 07:54:41', '2025-12-04 07:54:41'),
(14, 'B2', NULL, 1, 1, '2025-12-05 01:05:10', '2025-12-05 01:05:17'),
(15, 'B2-1', 14, 2, 1, '2025-12-05 01:05:31', '2025-12-05 01:05:31'),
(16, 'B2-2', 14, 2, 1, '2025-12-05 01:05:41', '2025-12-05 01:05:41'),
(17, 'B21-1', 15, 3, 1, '2025-12-05 01:05:47', '2025-12-05 01:05:47'),
(18, 'A', 1, 2, 1, '2026-03-05 06:39:58', '2026-03-05 06:39:58');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_12_01_050441_create_personal_access_tokens_table', 1),
(5, '2025_12_01_050515_create_permission_tables', 1),
(6, '2025_12_01_052314_create_refresh_tokens_table', 1),
(7, '2025_12_01_060342_add_role_to_users_table', 1),
(8, '2025_12_02_051353_create_units_table', 1),
(9, '2025_12_02_051354_create_product_categories_table', 1),
(10, '2025_12_02_051355_create_products_table', 1),
(11, '2025_12_02_051356_create_product_unit_table', 1),
(12, '2025_12_02_051357_create_product_batches_table', 1),
(13, '2025_12_02_051409_create_product_field_definitions_table', 1),
(14, '2025_12_02_051422_create_product_field_values_table', 1),
(15, '2025_12_02_051820_create_stock_movements_table', 1),
(16, '2025_12_04_100817_create_locations_table', 2),
(17, '2026_03_05_223152_create_system_settings_table', 3),
(18, '2026_03_06_131611_add_hs_code_to_product_batches', 4),
(19, '2026_03_07_085311_add_hs_code_to_sale_items_table', 5),
(20, '2026_03_07_091644_add_item_discount_to_sale_items_table', 6);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1);

-- --------------------------------------------------------

--
-- Table structure for table `parties`
--

CREATE TABLE `parties` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('supplier','customer','both','walkin') NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `account_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parties`
--

INSERT INTO `parties` (`id`, `code`, `name`, `type`, `phone`, `email`, `address`, `is_active`, `created_at`, `updated_at`, `account_id`) VALUES
(1, '1200-4', 'LifeCare Medical Traders', 'supplier', '9865650872', NULL, 'Dhangadhi', 1, '2025-12-23 03:18:10', '2025-12-28 00:10:58', 42),
(2, '2110-1', 'Saroj Suppliers Pvt. Ltd.', 'supplier', '9878272837', 'abcd@gmail.com', 'Dhangadhi', 1, '2025-12-23 03:20:11', '2025-12-23 03:20:11', 43),
(3, '1200-5', 'Sunrise Pharma Traders', 'supplier', '9878765652', NULL, 'Dhangadhi - 02, Kailali', 1, '2025-12-23 03:40:34', '2025-12-28 00:11:10', 44),
(4, '2110-2', 'Himalayan Drug Distributors', 'supplier', '9801928767`', NULL, NULL, 1, '2025-12-23 03:57:12', '2025-12-28 00:09:34', 45),
(5, '1200-6', 'National Medical Store', 'supplier', '9087664545', 'dsaf@gmail.com', 'Dhangadhi', 1, '2025-12-23 03:57:35', '2025-12-28 00:11:02', 46),
(6, '2110-3', 'City Medico Suppliers', 'supplier', '+9779865650872', 'citymedicosuppliers@gmail.com', 'Ward No. 2', 1, '2025-12-24 03:00:10', '2025-12-28 00:10:25', 47),
(7, '1200-7', 'City Pharmacy', 'customer', '9814698278', NULL, NULL, 1, '2025-12-28 00:11:34', '2025-12-28 00:11:34', 48),
(8, '1200-8', 'New Life Pharmacy', 'customer', NULL, NULL, NULL, 1, '2025-12-28 00:11:48', '2025-12-28 00:11:48', 49),
(9, '1200-9', 'CarePoint Pharmacy', 'customer', NULL, NULL, NULL, 1, '2025-12-28 00:12:05', '2025-12-28 00:12:05', 50),
(10, '1200-10', 'MediPlus Pharmacy', 'customer', NULL, NULL, NULL, 1, '2025-12-28 00:12:22', '2025-12-28 00:12:22', 51),
(11, '1200-11', 'Urban Health Store', 'customer', '+9779865650872', NULL, NULL, 1, '2025-12-28 00:12:35', '2025-12-28 00:12:35', 52),
(12, '1200-12', 'Shree Medical Hall', 'customer', '9814698278', NULL, NULL, 1, '2025-12-28 00:12:52', '2025-12-28 00:12:52', 53),
(13, 'WALKIN', 'Walk-in Customer', 'walkin', NULL, NULL, NULL, 1, NULL, NULL, 6);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `party_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_date` date NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_allocations`
--

CREATE TABLE `payment_allocations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_id` bigint(20) UNSIGNED NOT NULL,
  `document_type` enum('purchase','sale') DEFAULT NULL,
  `document_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'dashboard.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(2, 'products.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(3, 'products.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(4, 'products.edit', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(5, 'products.delete', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(6, 'categories.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(7, 'categories.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(8, 'units.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(9, 'units.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(10, 'batches.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(11, 'batches.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(12, 'stock.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(13, 'stock.adjust', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(14, 'stockin.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(15, 'stockin.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(16, 'stockin.edit', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(17, 'stockin.delete', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(18, 'stockout.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(19, 'stockout.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(20, 'stockout.edit', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(21, 'stockout.delete', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(22, 'expiry.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(23, 'expiry.return', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(24, 'suppliers.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(25, 'suppliers.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(26, 'purchases.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(27, 'purchases.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(28, 'purchases.edit', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(29, 'purchases.delete', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(30, 'grn.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(31, 'return.purchase.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(32, 'return.purchase.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(33, 'return.purchase.edit', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(34, 'return.purchase.delete', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(35, 'customers.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(36, 'customers.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(37, 'sales.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(38, 'sales.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(39, 'sales.edit', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(40, 'sales.cancel', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(41, 'return.sales.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(42, 'return.sales.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(43, 'return.sales.edit', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(44, 'return.sales.delete', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(45, 'return.expiry.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(46, 'return.expiry.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(47, 'accounts.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(48, 'accounts.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(49, 'ledger.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(50, 'ledger.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(51, 'ledger.edit', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(52, 'ledger.delete', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(53, 'voucher.journal.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(54, 'voucher.journal.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(55, 'voucher.journal.edit', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(56, 'voucher.journal.delete', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(57, 'voucher.receipt.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(58, 'voucher.receipt.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(59, 'voucher.receipt.edit', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(60, 'voucher.receipt.delete', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(61, 'voucher.payment.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(62, 'voucher.payment.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(63, 'voucher.payment.edit', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(64, 'voucher.payment.delete', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(65, 'voucher.contra.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(66, 'voucher.contra.create', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(67, 'voucher.contra.edit', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(68, 'voucher.contra.delete', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(69, 'bank.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(70, 'bank.reconcile', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(71, 'reports.trial_balance', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(72, 'reports.balance_sheet', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(73, 'reports.profit_loss', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(74, 'reports.cash_flow', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(75, 'reports.daybook', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(76, 'audit.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(77, 'audit.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(78, 'staff.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(79, 'staff.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(80, 'roles.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(81, 'roles.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(82, 'roles.assign', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(83, 'settings.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(84, 'logs.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(85, 'logs.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(86, 'locations.manage', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(87, 'locations.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(88, 'accounting.view', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(8, 'App\\Models\\User', 3, 'access_token', 'f5510a4936c87e73608eed9a4f3c7cac13729af5ac528e5487d2607179cac0f5', '[\"*\"]', '2025-12-04 22:49:48', NULL, '2025-12-04 04:34:43', '2025-12-04 22:49:48'),
(125, 'App\\Models\\User', 2, 'access_token', '8daac012d0ebfdc5247728d772d63f62e2b48a4dac8ae558dc7f3126a170a535', '[\"*\"]', NULL, NULL, '2026-04-20 05:47:37', '2026-04-20 05:47:37'),
(129, 'App\\Models\\User', 4, 'access_token', '09e0d9571fb234a825a51207c39199037209bc7fbef0625d0c6d90c9e7ed8a74', '[\"*\"]', NULL, NULL, '2026-04-20 14:22:37', '2026-04-20 14:22:37');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `sku` varchar(255) NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reorder_level` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `min_stock_alert` int(11) NOT NULL DEFAULT 0,
  `max_stock_limit` int(11) NOT NULL DEFAULT 0,
  `tax_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `sku`, `category_id`, `unit_id`, `reorder_level`, `status`, `description`, `min_stock_alert`, `max_stock_limit`, `tax_percent`, `meta`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Amoxicillin 500mg', 'AMX-500', 11, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(2, 'Azithromycin 500mg', 'AZI-500', 11, 4, 10, 1, NULL, 5, 0, 0.00, '{\"brand_name\":\"Azith\",\"generic_name\":\"Azithromycin\",\"strength\":\"500mg\"}', 1, '2026-03-05 16:32:12', '2026-03-05 16:36:44'),
(3, 'Ciprofloxacin 500mg', 'CIP-500', 11, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(4, 'Cefixime 200mg', 'CEF-200', 11, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(5, 'Metronidazole 400mg', 'MET-400', 11, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(6, 'Paracetamol 500mg', 'PCM-500', 12, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(7, 'Ibuprofen 400mg', 'IBU-400', 12, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(8, 'Nimulid 100mg', 'NIM-100', 12, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(9, 'Flexon Tablet', 'FLX-TAB', 12, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(10, 'Diclofenac Gel 30g', 'DIC-GEL', 12, 6, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(11, 'Montelukast 10mg', 'MON-10', 13, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(12, 'Salbutamol Inhaler', 'SAL-INH', 13, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(13, 'Levocetirizine 5mg', 'LEV-5', 10, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(14, 'Cetirizine 10mg', 'CET-10', 10, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(15, 'Ascoril Syrup 100ml', 'ASC-100', 4, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(16, 'Limcee Vitamin C', 'LIM-CEE', 14, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(17, 'Vitamin D3 60K', 'VIT-D3', 14, 2, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(18, 'Shelcal 500', 'SHE-500', 14, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(19, 'Revital H Capsule', 'REV-H', 14, 2, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(20, 'Becosules Z', 'BEC-Z', 14, 2, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(21, 'Disposable Syringe 5ml', 'SYR-5ML', 22, 4, 10, 1, NULL, 5, 0, 13.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(22, 'Surgical Gloves Size 7', 'GLV-7', 21, 4, 10, 1, NULL, 5, 0, 13.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(23, 'Face Mask 3-Ply', 'MSK-3P', 21, 4, 10, 1, NULL, 5, 0, 13.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(24, 'Elastic Bandage 4\"', 'BAN-4', 24, 4, 10, 1, NULL, 5, 0, 13.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(25, 'IV Cannula 20G', 'IV-20G', 23, 4, 10, 1, NULL, 5, 0, 13.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(26, 'Pantoprazole 40mg', 'PAN-40', 1, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(27, 'Omeprazole 20mg', 'OME-20', 5, 2, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(28, 'Digene Syrup 200ml', 'DIG-200', 4, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(29, 'ORS Sachet', 'ORS-NPL', 1, 10, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(30, 'Domperidone 10mg', 'DOM-10', 1, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(31, 'Amlodipine 5mg', 'AML-5', 1, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(32, 'Atorvastatin 10mg', 'ATO-10', 1, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(33, 'Telmisartan 40mg', 'TEL-40', 1, 4, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(34, 'Betadine Ointment 20g', 'BET-20G', 15, 6, 10, 1, NULL, 5, 0, 0.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(35, 'Dettol Antiseptic 500ml', 'DET-500', 18, 4, 10, 1, NULL, 5, 0, 13.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(36, 'Baby Diapers (Medium)', 'DIA-MED', 17, 4, 10, 1, NULL, 5, 0, 13.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(37, 'BP Monitor (Digital)', 'BPM-DIG', 27, 4, 10, 1, NULL, 5, 0, 13.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(38, 'Digital Thermometer', 'THE-DIG', 26, 4, 10, 1, NULL, 5, 0, 13.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(39, 'Nebulizer Machine', 'NEB-MAC', 25, 4, 10, 1, NULL, 5, 0, 13.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(40, 'Accu-Chek Active Strips', 'ACC-50', 37, 4, 10, 1, NULL, 5, 0, 13.00, NULL, 1, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(41, 'Indol - 50', 'FC-TAB-000001', 32, NULL, 0, 1, NULL, 0, 0, 0.00, '{\"generic_name\":\"Indomethacin\",\"brand_name\":\"Indol - 50\",\"manufacturer\":\"Leben Laborataries Pvt. Ltd.\",\"leaf_type\":\"1X10\",\"strength\":\"50 mg\"}', 1, '2026-03-28 04:20:53', '2026-03-28 04:20:53');

-- --------------------------------------------------------

--
-- Table structure for table `product_batches`
--

CREATE TABLE `product_batches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `batch_no` varchar(255) NOT NULL,
  `hs_code` varchar(255) DEFAULT NULL,
  `manufactured_at` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `shelf_life_value` varchar(20) DEFAULT NULL,
  `shelf_life_unit` enum('days','months','years','') DEFAULT NULL,
  `unit_id` int(11) NOT NULL DEFAULT 0,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `opening_stock` int(11) NOT NULL DEFAULT 0,
  `current_stock` int(11) NOT NULL DEFAULT 0,
  `mrp` decimal(10,2) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `vat` int(11) NOT NULL DEFAULT 13,
  `vat_included` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `profit_margin` decimal(5,2) DEFAULT NULL COMMENT 'Percentage margin',
  `selling_price_calculated` decimal(10,2) DEFAULT NULL,
  `is_auto_calculated` tinyint(1) NOT NULL DEFAULT 1,
  `purchase_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_batches`
--

INSERT INTO `product_batches` (`id`, `product_id`, `batch_no`, `hs_code`, `manufactured_at`, `expiry_date`, `shelf_life_value`, `shelf_life_unit`, `unit_id`, `quantity`, `opening_stock`, `current_stock`, `mrp`, `cost_price`, `selling_price`, `vat`, `vat_included`, `is_active`, `created_at`, `updated_at`, `profit_margin`, `selling_price_calculated`, `is_auto_calculated`, `purchase_id`) VALUES
(1, 1, 'AMX-2026-01', NULL, NULL, '2027-03-31', NULL, NULL, 3, 0, 0, 90, NULL, 100.00, 120.00, 13, 1, 1, '2026-03-06 07:43:26', '2026-03-07 04:01:52', 20.00, 120.00, 1, NULL),
(2, 2, 'AZIT-2026-01', '3099', NULL, '2027-03-27', NULL, NULL, 4, 0, 0, 375, NULL, 1000.00, 1200.00, 13, 1, 1, '2026-03-06 07:43:26', '2026-03-07 07:48:12', 20.00, 1200.00, 1, NULL),
(3, 3, 'CIPRO-2029-1', '3090', NULL, '2028-03-31', NULL, NULL, 3, 0, 0, 990, NULL, 50.00, 62.50, 13, 1, 1, '2026-03-07 05:43:19', '2026-03-07 07:48:12', 25.00, 62.50, 1, NULL),
(4, 6, '-', '11', '2026-03-01', '2028-03-03', NULL, NULL, 3, 0, 0, 50, NULL, 150.00, 180.00, 13, 1, 1, '2026-03-25 06:00:59', '2026-03-25 06:00:59', 20.00, 180.00, 1, NULL),
(5, 41, 'X', '101', '2026-03-01', '2027-03-30', NULL, NULL, 4, 0, 0, 295, NULL, 350.00, 420.00, 13, 1, 1, '2026-03-28 04:23:34', '2026-03-28 04:26:27', 20.00, 420.00, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`id`, `name`, `code`, `parent_id`, `slug`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Medicines', 'MED', NULL, NULL, 1, '2025-12-03 22:03:51', '2025-12-04 05:16:47'),
(2, 'Personal Care', 'PC', NULL, NULL, 1, '2025-12-03 22:04:37', '2025-12-03 22:04:37'),
(4, 'Syrup', 'SYR', 1, NULL, 1, '2025-12-03 22:18:54', '2025-12-03 22:18:54'),
(5, 'Capsule', 'CAP', 1, NULL, 1, '2025-12-04 04:32:43', '2025-12-04 04:32:43'),
(6, 'Injections', 'INJ', 1, NULL, 1, '2025-12-04 04:33:13', '2025-12-04 04:33:13'),
(10, 'Anti-allergics', 'A-ALL', 1, NULL, 1, '2025-12-04 04:59:00', '2025-12-04 04:59:00'),
(11, 'Antibiotics', 'AB', 1, NULL, 1, '2025-12-04 04:59:15', '2025-12-04 04:59:15'),
(12, 'Analgesics & Pain Relief', 'APR', 1, NULL, 1, '2025-12-04 04:59:30', '2025-12-04 04:59:30'),
(13, 'Respiratory Medicines', 'RM', 1, NULL, 1, '2025-12-04 04:59:52', '2025-12-04 04:59:52'),
(14, 'Vitamins & Supplements', 'VS', 1, NULL, 1, '2025-12-04 05:00:04', '2025-12-04 05:00:04'),
(15, 'Skin Care', 'SC', 2, NULL, 1, '2025-12-04 05:00:25', '2025-12-04 05:00:25'),
(17, 'Baby Care', 'BC', 2, NULL, 1, '2025-12-04 05:00:46', '2025-12-04 05:00:46'),
(18, 'Hygiene & Sanitation', 'HAS', 2, NULL, 1, '2025-12-04 05:00:58', '2025-12-04 05:00:58'),
(19, 'Surgical & Medical Devices', 'SMD', NULL, NULL, 1, '2025-12-04 05:01:31', '2025-12-04 05:01:31'),
(20, 'Surgical Instruments', 'SI', 19, NULL, 1, '2025-12-04 05:01:42', '2025-12-04 05:01:42'),
(21, 'Gloves, Masks & PPE', 'GMPPE', 19, NULL, 1, '2025-12-04 05:01:54', '2025-12-04 05:01:54'),
(22, 'Syringes & Needles', 'SN', 19, NULL, 1, '2025-12-04 05:02:04', '2025-12-04 05:02:04'),
(23, 'IV Cannulas', 'IV', 19, NULL, 1, '2025-12-04 05:02:12', '2025-12-04 05:02:12'),
(24, 'Bandages', 'BAN', 19, NULL, 1, '2025-12-04 05:02:41', '2025-12-04 05:02:41'),
(25, 'Nebulizers', 'NEB', 19, NULL, 1, '2025-12-04 05:02:53', '2025-12-04 05:02:53'),
(26, 'Thermometers', 'THERM', 19, NULL, 1, '2025-12-04 05:03:39', '2025-12-04 05:03:39'),
(27, 'BP Machines', 'BP', 19, NULL, 1, '2025-12-04 05:03:51', '2025-12-04 05:03:51'),
(28, 'Hair Care', 'HC', 2, NULL, 1, '2025-12-04 05:04:31', '2025-12-04 18:29:52'),
(30, 'Tablets', 'TAB', 1, NULL, 1, '2025-12-04 18:56:22', '2025-12-04 18:56:22'),
(31, 'Compressed Tablets', 'C-TAB', 30, NULL, 1, '2025-12-14 02:14:19', '2025-12-14 18:24:53'),
(32, 'Film-Coated Tablets', 'FC-TAB', 30, NULL, 1, '2025-12-14 02:14:34', '2025-12-14 02:14:34'),
(33, 'Enteric-coated Tablets', 'EC-TAB', 30, NULL, 1, '2025-12-14 02:15:14', '2025-12-14 02:15:14'),
(34, 'Chewable Tablets', 'CH-TAB', 30, NULL, 1, '2025-12-14 02:15:28', '2025-12-15 03:33:32'),
(35, 'Dispersible/Soluble Tablets', 'D-TAB', 30, NULL, 1, '2025-12-14 02:15:43', '2025-12-14 02:15:43'),
(36, 'Modified-Release Tablets', 'MR-TAB', 30, NULL, 1, '2025-12-14 02:16:25', '2025-12-14 02:16:25'),
(37, 'Lab Reagent', 'LREG', NULL, NULL, 1, '2026-03-03 22:57:41', '2026-03-03 22:57:41'),
(38, 'Others', 'OTH', NULL, NULL, 1, '2026-03-03 23:12:52', '2026-03-03 23:12:52'),
(39, 'Lab Equipments', 'LE', 19, NULL, 1, '2026-03-03 23:25:16', '2026-03-03 23:25:16');

-- --------------------------------------------------------

--
-- Table structure for table `product_field_definitions`
--

CREATE TABLE `product_field_definitions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `label` varchar(255) NOT NULL,
  `type` enum('text','textarea','number','decimal','integer','date','datetime','boolean','select','multi_select','file','currency','checkbox','dictionary') NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `validation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`validation`)),
  `required` tinyint(1) NOT NULL DEFAULT 0,
  `applies_to` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`applies_to`)),
  `dictionary` int(11) DEFAULT 0,
  `order` int(11) NOT NULL DEFAULT 1,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_field_definitions`
--

INSERT INTO `product_field_definitions` (`id`, `key`, `label`, `type`, `options`, `validation`, `required`, `applies_to`, `dictionary`, `order`, `created_by`, `created_at`, `updated_at`) VALUES
(5, 'brand_name', 'Brand Name', 'dictionary', NULL, '{\"numeric\":false}', 1, '[]', 2, 2, NULL, '2025-12-05 02:02:21', '2025-12-18 02:42:53'),
(6, 'generic_name', 'Generic Name', 'dictionary', NULL, '{\"numeric\":false}', 1, '[]', 3, 1, NULL, '2025-12-05 02:13:39', '2025-12-15 02:57:24'),
(7, 'manufacturer', 'Manufacturer', 'dictionary', NULL, '{\"numeric\":false}', 0, NULL, 1, 3, NULL, '2025-12-05 03:03:17', '2025-12-11 08:10:51'),
(9, 'dosage_form', 'Dosage Form', 'select', '[\"Tablet\",\"Capsule\",\"Syrup\",\"Injection\",\"Ointment\",\"Drops\"]', '{\"numeric\":false}', 0, '[1]', NULL, 5, NULL, '2025-12-05 03:05:46', '2025-12-14 07:45:38'),
(12, 'leaf_type', 'Leaf Type', 'dictionary', NULL, '{\"numeric\":false}', 1, '[14,13,12,11,10,6,5,4,36,35,34,33,32,31]', 5, 4, NULL, '2025-12-14 07:41:31', '2025-12-15 00:26:00'),
(13, 'strength', 'Strength', 'dictionary', NULL, '{\"numeric\":false}', 0, '[]', 7, 6, NULL, '2025-12-15 00:43:24', '2025-12-15 00:45:07');

-- --------------------------------------------------------

--
-- Table structure for table `product_field_values`
--

CREATE TABLE `product_field_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `field_definition_id` bigint(20) UNSIGNED NOT NULL,
  `value_string` varchar(255) DEFAULT NULL,
  `value_int` int(11) DEFAULT NULL,
  `value_decimal` decimal(20,6) DEFAULT NULL,
  `value_date` date DEFAULT NULL,
  `value_bool` tinyint(1) DEFAULT NULL,
  `value_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`value_json`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_field_values`
--

INSERT INTO `product_field_values` (`id`, `product_id`, `field_definition_id`, `value_string`, `value_int`, `value_decimal`, `value_date`, `value_bool`, `value_json`, `created_at`, `updated_at`) VALUES
(1, 1, 5, 'Mox', 103, NULL, NULL, NULL, '{\"text\":\"Mox\",\"id\":103}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(2, 1, 6, 'Amoxicillin', 48, NULL, NULL, NULL, '{\"text\":\"Amoxicillin\",\"id\":48}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(3, 1, 13, '500mg', 104, NULL, NULL, NULL, '{\"text\":\"500mg\",\"id\":104}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(7, 3, 5, 'Cipro', 107, NULL, NULL, NULL, '{\"text\":\"Cipro\",\"id\":107}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(8, 3, 6, 'Ciprofloxacin', 108, NULL, NULL, NULL, '{\"text\":\"Ciprofloxacin\",\"id\":108}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(9, 3, 13, '500mg', 104, NULL, NULL, NULL, '{\"text\":\"500mg\",\"id\":104}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(10, 4, 5, 'Cef-O', 109, NULL, NULL, NULL, '{\"text\":\"Cef-O\",\"id\":109}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(11, 4, 6, 'Cefixime', 110, NULL, NULL, NULL, '{\"text\":\"Cefixime\",\"id\":110}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(12, 4, 13, '200mg', 111, NULL, NULL, NULL, '{\"text\":\"200mg\",\"id\":111}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(13, 5, 5, 'Metrogyl', 112, NULL, NULL, NULL, '{\"text\":\"Metrogyl\",\"id\":112}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(14, 5, 6, 'Metronidazole', 113, NULL, NULL, NULL, '{\"text\":\"Metronidazole\",\"id\":113}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(15, 5, 13, '400mg', 114, NULL, NULL, NULL, '{\"text\":\"400mg\",\"id\":114}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(16, 6, 5, 'Napa', 41, NULL, NULL, NULL, '{\"text\":\"Napa\",\"id\":41}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(17, 6, 6, 'Paracetamol', 5, NULL, NULL, NULL, '{\"text\":\"Paracetamol\",\"id\":5}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(18, 6, 13, '500mg', 104, NULL, NULL, NULL, '{\"text\":\"500mg\",\"id\":104}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(19, 7, 5, 'Brufen', 56, NULL, NULL, NULL, '{\"text\":\"Brufen\",\"id\":56}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(20, 7, 6, 'Ibuprofen', 46, NULL, NULL, NULL, '{\"text\":\"Ibuprofen\",\"id\":46}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(21, 7, 13, '400mg', 114, NULL, NULL, NULL, '{\"text\":\"400mg\",\"id\":114}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(22, 8, 5, 'Nimulid', 115, NULL, NULL, NULL, '{\"text\":\"Nimulid\",\"id\":115}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(23, 8, 6, 'Nimesulide', 116, NULL, NULL, NULL, '{\"text\":\"Nimesulide\",\"id\":116}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(24, 8, 13, '100mg', 117, NULL, NULL, NULL, '{\"text\":\"100mg\",\"id\":117}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(25, 9, 5, 'Flexon', 118, NULL, NULL, NULL, '{\"text\":\"Flexon\",\"id\":118}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(26, 9, 6, 'Ibuprofen + Paracetamol', 119, NULL, NULL, NULL, '{\"text\":\"Ibuprofen + Paracetamol\",\"id\":119}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(27, 9, 13, 'Standard', 120, NULL, NULL, NULL, '{\"text\":\"Standard\",\"id\":120}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(28, 10, 5, 'Voveran', 121, NULL, NULL, NULL, '{\"text\":\"Voveran\",\"id\":121}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(29, 10, 6, 'Diclofenac Sodium', 122, NULL, NULL, NULL, '{\"text\":\"Diclofenac Sodium\",\"id\":122}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(30, 10, 13, '1% w/w', 123, NULL, NULL, NULL, '{\"text\":\"1% w\\/w\",\"id\":123}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(31, 11, 5, 'Montair', 124, NULL, NULL, NULL, '{\"text\":\"Montair\",\"id\":124}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(32, 11, 6, 'Montelukast Sodium', 125, NULL, NULL, NULL, '{\"text\":\"Montelukast Sodium\",\"id\":125}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(33, 11, 13, '10mg', 126, NULL, NULL, NULL, '{\"text\":\"10mg\",\"id\":126}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(34, 12, 5, 'Asthalin', 127, NULL, NULL, NULL, '{\"text\":\"Asthalin\",\"id\":127}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(35, 12, 6, 'Salbutamol', 128, NULL, NULL, NULL, '{\"text\":\"Salbutamol\",\"id\":128}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(36, 12, 13, '100mcg', 129, NULL, NULL, NULL, '{\"text\":\"100mcg\",\"id\":129}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(37, 13, 5, 'Levocet', 130, NULL, NULL, NULL, '{\"text\":\"Levocet\",\"id\":130}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(38, 13, 6, 'Levocetirizine Dihydrochloride', 131, NULL, NULL, NULL, '{\"text\":\"Levocetirizine Dihydrochloride\",\"id\":131}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(39, 13, 13, '5mg', 132, NULL, NULL, NULL, '{\"text\":\"5mg\",\"id\":132}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(40, 14, 5, 'Okacet', 133, NULL, NULL, NULL, '{\"text\":\"Okacet\",\"id\":133}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(41, 14, 6, 'Cetirizine Hydrochloride', 134, NULL, NULL, NULL, '{\"text\":\"Cetirizine Hydrochloride\",\"id\":134}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(42, 14, 13, '10mg', 126, NULL, NULL, NULL, '{\"text\":\"10mg\",\"id\":126}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(43, 15, 5, 'Ascoril', 135, NULL, NULL, NULL, '{\"text\":\"Ascoril\",\"id\":135}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(44, 15, 6, 'Terbutaline + Bromhexine', 136, NULL, NULL, NULL, '{\"text\":\"Terbutaline + Bromhexine\",\"id\":136}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(45, 15, 13, '100ml', 137, NULL, NULL, NULL, '{\"text\":\"100ml\",\"id\":137}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(46, 16, 5, 'Limcee', 138, NULL, NULL, NULL, '{\"text\":\"Limcee\",\"id\":138}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(47, 16, 6, 'Vitamin C', 139, NULL, NULL, NULL, '{\"text\":\"Vitamin C\",\"id\":139}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(48, 16, 13, '500mg', 104, NULL, NULL, NULL, '{\"text\":\"500mg\",\"id\":104}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(49, 17, 5, 'Calcirol', 140, NULL, NULL, NULL, '{\"text\":\"Calcirol\",\"id\":140}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(50, 17, 6, 'Cholecalciferol', 141, NULL, NULL, NULL, '{\"text\":\"Cholecalciferol\",\"id\":141}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(51, 17, 13, '60000 IU', 142, NULL, NULL, NULL, '{\"text\":\"60000 IU\",\"id\":142}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(52, 18, 5, 'Shelcal', 143, NULL, NULL, NULL, '{\"text\":\"Shelcal\",\"id\":143}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(53, 18, 6, 'Calcium + Vitamin D3', 144, NULL, NULL, NULL, '{\"text\":\"Calcium + Vitamin D3\",\"id\":144}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(54, 18, 13, '500mg', 104, NULL, NULL, NULL, '{\"text\":\"500mg\",\"id\":104}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(55, 19, 5, 'Revital H', 145, NULL, NULL, NULL, '{\"text\":\"Revital H\",\"id\":145}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(56, 19, 6, 'Multivitamins + Ginseng', 146, NULL, NULL, NULL, '{\"text\":\"Multivitamins + Ginseng\",\"id\":146}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(57, 19, 13, 'Standard', 120, NULL, NULL, NULL, '{\"text\":\"Standard\",\"id\":120}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(58, 20, 5, 'Becosules Z', 147, NULL, NULL, NULL, '{\"text\":\"Becosules Z\",\"id\":147}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(59, 20, 6, 'B-Complex + Zinc', 148, NULL, NULL, NULL, '{\"text\":\"B-Complex + Zinc\",\"id\":148}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(60, 20, 13, 'Standard', 120, NULL, NULL, NULL, '{\"text\":\"Standard\",\"id\":120}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(61, 21, 5, 'Dispovan', 149, NULL, NULL, NULL, '{\"text\":\"Dispovan\",\"id\":149}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(62, 21, 6, 'Syringe', 150, NULL, NULL, NULL, '{\"text\":\"Syringe\",\"id\":150}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(63, 21, 13, '5ml', 151, NULL, NULL, NULL, '{\"text\":\"5ml\",\"id\":151}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(64, 22, 5, 'Surgicare', 90, NULL, NULL, NULL, '{\"text\":\"Surgicare\",\"id\":90}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(65, 22, 6, 'Gloves', 152, NULL, NULL, NULL, '{\"text\":\"Gloves\",\"id\":152}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(66, 22, 13, 'Size 7', 153, NULL, NULL, NULL, '{\"text\":\"Size 7\",\"id\":153}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(67, 23, 5, 'HealthCare', 154, NULL, NULL, NULL, '{\"text\":\"HealthCare\",\"id\":154}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(68, 23, 6, 'Mask', 155, NULL, NULL, NULL, '{\"text\":\"Mask\",\"id\":155}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(69, 23, 13, '3-Ply', 156, NULL, NULL, NULL, '{\"text\":\"3-Ply\",\"id\":156}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(70, 24, 5, 'Crepe', 157, NULL, NULL, NULL, '{\"text\":\"Crepe\",\"id\":157}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(71, 24, 6, 'Bandage', 158, NULL, NULL, NULL, '{\"text\":\"Bandage\",\"id\":158}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(72, 24, 13, '4 Inch', 159, NULL, NULL, NULL, '{\"text\":\"4 Inch\",\"id\":159}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(73, 25, 5, 'Jelco', 160, NULL, NULL, NULL, '{\"text\":\"Jelco\",\"id\":160}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(74, 25, 6, 'Cannula', 161, NULL, NULL, NULL, '{\"text\":\"Cannula\",\"id\":161}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(75, 25, 13, '20G', 162, NULL, NULL, NULL, '{\"text\":\"20G\",\"id\":162}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(76, 26, 5, 'Pantocid', 62, NULL, NULL, NULL, '{\"text\":\"Pantocid\",\"id\":62}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(77, 26, 6, 'Pantoprazole', 61, NULL, NULL, NULL, '{\"text\":\"Pantoprazole\",\"id\":61}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(78, 26, 13, '40mg', 163, NULL, NULL, NULL, '{\"text\":\"40mg\",\"id\":163}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(79, 27, 5, 'Omez', 164, NULL, NULL, NULL, '{\"text\":\"Omez\",\"id\":164}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(80, 27, 6, 'Omeprazole', 165, NULL, NULL, NULL, '{\"text\":\"Omeprazole\",\"id\":165}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(81, 27, 13, '20mg', 166, NULL, NULL, NULL, '{\"text\":\"20mg\",\"id\":166}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(82, 28, 5, 'Digene', 167, NULL, NULL, NULL, '{\"text\":\"Digene\",\"id\":167}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(83, 28, 6, 'Antacid', 168, NULL, NULL, NULL, '{\"text\":\"Antacid\",\"id\":168}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(84, 28, 13, '200ml', 169, NULL, NULL, NULL, '{\"text\":\"200ml\",\"id\":169}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(85, 29, 5, 'Jeevan Jal', 170, NULL, NULL, NULL, '{\"text\":\"Jeevan Jal\",\"id\":170}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(86, 29, 6, 'Oral Rehydration Salts', 171, NULL, NULL, NULL, '{\"text\":\"Oral Rehydration Salts\",\"id\":171}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(87, 29, 13, 'Standard', 120, NULL, NULL, NULL, '{\"text\":\"Standard\",\"id\":120}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(88, 30, 5, 'Domstal', 172, NULL, NULL, NULL, '{\"text\":\"Domstal\",\"id\":172}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(89, 30, 6, 'Domperidone', 173, NULL, NULL, NULL, '{\"text\":\"Domperidone\",\"id\":173}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(90, 30, 13, '10mg', 126, NULL, NULL, NULL, '{\"text\":\"10mg\",\"id\":126}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(91, 31, 5, 'Amlovas', 174, NULL, NULL, NULL, '{\"text\":\"Amlovas\",\"id\":174}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(92, 31, 6, 'Amlodipine Besylate', 175, NULL, NULL, NULL, '{\"text\":\"Amlodipine Besylate\",\"id\":175}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(93, 31, 13, '5mg', 132, NULL, NULL, NULL, '{\"text\":\"5mg\",\"id\":132}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(94, 32, 5, 'Atorva', 176, NULL, NULL, NULL, '{\"text\":\"Atorva\",\"id\":176}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(95, 32, 6, 'Atorvastatin', 177, NULL, NULL, NULL, '{\"text\":\"Atorvastatin\",\"id\":177}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(96, 32, 13, '10mg', 126, NULL, NULL, NULL, '{\"text\":\"10mg\",\"id\":126}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(97, 33, 5, 'Telma', 178, NULL, NULL, NULL, '{\"text\":\"Telma\",\"id\":178}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(98, 33, 6, 'Telmisartan', 179, NULL, NULL, NULL, '{\"text\":\"Telmisartan\",\"id\":179}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(99, 33, 13, '40mg', 163, NULL, NULL, NULL, '{\"text\":\"40mg\",\"id\":163}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(100, 34, 5, 'Betadine', 180, NULL, NULL, NULL, '{\"text\":\"Betadine\",\"id\":180}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(101, 34, 6, 'Povidone-Iodine', 181, NULL, NULL, NULL, '{\"text\":\"Povidone-Iodine\",\"id\":181}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(102, 34, 13, '5% w/w', 182, NULL, NULL, NULL, '{\"text\":\"5% w\\/w\",\"id\":182}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(103, 35, 5, 'Dettol', 183, NULL, NULL, NULL, '{\"text\":\"Dettol\",\"id\":183}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(104, 35, 6, 'Chloroxylenol', 184, NULL, NULL, NULL, '{\"text\":\"Chloroxylenol\",\"id\":184}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(105, 35, 13, '500ml', 185, NULL, NULL, NULL, '{\"text\":\"500ml\",\"id\":185}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(106, 36, 5, 'Pampers', 85, NULL, NULL, NULL, '{\"text\":\"Pampers\",\"id\":85}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(107, 36, 6, 'Diaper', 186, NULL, NULL, NULL, '{\"text\":\"Diaper\",\"id\":186}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(108, 36, 13, 'Medium (M)', 187, NULL, NULL, NULL, '{\"text\":\"Medium (M)\",\"id\":187}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(109, 37, 5, 'Omron HEM-7120', 188, NULL, NULL, NULL, '{\"text\":\"Omron HEM-7120\",\"id\":188}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(110, 37, 6, 'Blood Pressure Monitor', 189, NULL, NULL, NULL, '{\"text\":\"Blood Pressure Monitor\",\"id\":189}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(111, 37, 13, 'Digital', 190, NULL, NULL, NULL, '{\"text\":\"Digital\",\"id\":190}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(112, 38, 5, 'Dr. Morepen', 93, NULL, NULL, NULL, '{\"text\":\"Dr. Morepen\",\"id\":93}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(113, 38, 6, 'Thermometer', 94, NULL, NULL, NULL, '{\"text\":\"Thermometer\",\"id\":94}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(114, 38, 13, 'Digital', 190, NULL, NULL, NULL, '{\"text\":\"Digital\",\"id\":190}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(115, 39, 5, 'Rossmax', 191, NULL, NULL, NULL, '{\"text\":\"Rossmax\",\"id\":191}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(116, 39, 6, 'Nebulizer', 192, NULL, NULL, NULL, '{\"text\":\"Nebulizer\",\"id\":192}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(117, 39, 13, 'Heavy Duty', 193, NULL, NULL, NULL, '{\"text\":\"Heavy Duty\",\"id\":193}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(118, 40, 5, 'Accu-Chek', 194, NULL, NULL, NULL, '{\"text\":\"Accu-Chek\",\"id\":194}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(119, 40, 6, 'Glucose Test Strips', 195, NULL, NULL, NULL, '{\"text\":\"Glucose Test Strips\",\"id\":195}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(120, 40, 13, '50 Strips', 196, NULL, NULL, NULL, '{\"text\":\"50 Strips\",\"id\":196}', '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(121, 2, 5, 'Azith', NULL, NULL, NULL, NULL, NULL, '2026-03-05 16:36:44', '2026-03-05 16:36:44'),
(122, 2, 6, 'Azithromycin', NULL, NULL, NULL, NULL, NULL, '2026-03-05 16:36:44', '2026-03-05 16:36:44'),
(123, 2, 13, '500mg', NULL, NULL, NULL, NULL, NULL, '2026-03-05 16:36:44', '2026-03-05 16:36:44'),
(124, 41, 5, 'Indol - 50', NULL, NULL, NULL, NULL, NULL, '2026-03-28 04:20:53', '2026-03-28 04:20:53'),
(125, 41, 6, 'Indomethacin', NULL, NULL, NULL, NULL, NULL, '2026-03-28 04:20:53', '2026-03-28 04:20:53'),
(126, 41, 7, 'Leben Laborataries Pvt. Ltd.', NULL, NULL, NULL, NULL, NULL, '2026-03-28 04:20:53', '2026-03-28 04:20:53'),
(127, 41, 12, '1X10', NULL, NULL, NULL, NULL, NULL, '2026-03-28 04:20:53', '2026-03-28 04:20:53'),
(128, 41, 13, '50 mg', NULL, NULL, NULL, NULL, NULL, '2026-03-28 04:20:53', '2026-03-28 04:20:53');

-- --------------------------------------------------------

--
-- Table structure for table `product_units`
--

CREATE TABLE `product_units` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `unit_id` bigint(20) UNSIGNED NOT NULL,
  `level` int(11) NOT NULL DEFAULT 1,
  `conversion_factor` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_units`
--

INSERT INTO `product_units` (`id`, `product_id`, `unit_id`, `level`, `conversion_factor`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(2, 1, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(5, 3, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(6, 3, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(7, 4, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(8, 4, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(9, 5, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(10, 5, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(11, 6, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(12, 6, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(13, 7, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(14, 7, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(15, 8, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(16, 8, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(17, 9, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(18, 9, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(19, 11, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(20, 11, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(21, 12, 9, 2, 50, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(22, 13, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(23, 13, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(24, 14, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(25, 14, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(26, 15, 5, 2, 12, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(27, 16, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(28, 16, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(29, 18, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(30, 18, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(31, 21, 9, 2, 50, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(32, 22, 9, 2, 50, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(33, 23, 9, 2, 50, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(34, 24, 9, 2, 50, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(35, 25, 9, 2, 50, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(36, 26, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(37, 26, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(38, 28, 5, 2, 12, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(39, 30, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(40, 30, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(41, 31, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(42, 31, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(43, 32, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(44, 32, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(45, 33, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(46, 33, 1, 3, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(47, 35, 5, 2, 12, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(48, 36, 11, 2, 25, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(49, 37, 9, 2, 50, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(50, 38, 9, 2, 50, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(51, 39, 9, 2, 50, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(52, 40, 3, 2, 10, '2026-03-05 16:32:12', '2026-03-05 16:32:12'),
(53, 2, 4, 1, 1, '2026-03-05 16:36:44', '2026-03-05 16:36:44'),
(54, 2, 3, 2, 10, '2026-03-05 16:36:44', '2026-03-05 16:36:44'),
(55, 2, 1, 3, 5, '2026-03-05 16:36:44', '2026-03-05 16:36:44'),
(56, 41, 4, 1, 1, '2026-03-28 04:20:53', '2026-03-28 04:20:53'),
(57, 41, 3, 2, 30, '2026-03-28 04:20:53', '2026-03-28 04:20:53');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED DEFAULT NULL,
  `invoice_no` varchar(100) NOT NULL,
  `invoice_date` date NOT NULL,
  `gross_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `vat_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('open','partial','paid') DEFAULT 'open',
  `remarks` text DEFAULT NULL,
  `supplier_invoice_no` varchar(100) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `supplier_id`, `invoice_no`, `invoice_date`, `gross_amount`, `vat_amount`, `discount_amount`, `total_amount`, `status`, `remarks`, `supplier_invoice_no`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 9, 'PUR-202603-000001', '2026-03-06', 11000.00, 1430.00, 0.00, 12430.00, 'open', NULL, NULL, 2, '2026-03-06 07:43:26', '2026-03-06 07:43:26'),
(2, 6, 'PUR-202603-000002', '2026-03-07', 5000.00, 650.00, 0.00, 5650.00, 'partial', NULL, NULL, 2, '2026-03-07 05:43:19', '2026-03-07 05:43:19'),
(3, 4, 'PUR-202603-000003', '2026-03-25', 750.00, 97.50, 0.00, 847.50, 'paid', NULL, NULL, 2, '2026-03-25 06:00:59', '2026-03-25 06:00:59'),
(4, 12, 'PUR-202603-000004', '2026-03-28', 3500.00, 455.00, 0.00, 3955.00, 'paid', NULL, NULL, 2, '2026-03-28 04:23:34', '2026-03-28 04:23:34');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `cost_price` decimal(10,2) NOT NULL,
  `profit_margin` decimal(5,2) DEFAULT NULL,
  `selling_price` decimal(10,2) NOT NULL,
  `vat_amount` double(10,2) NOT NULL,
  `vat_included` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `inventory_value` decimal(12,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_items`
--

INSERT INTO `purchase_items` (`id`, `purchase_id`, `product_id`, `batch_id`, `unit_id`, `quantity`, `cost_price`, `profit_margin`, `selling_price`, `vat_amount`, `vat_included`, `created_at`, `updated_at`, `inventory_value`) VALUES
(1, 1, 1, 1, 3, 100, 100.00, 20.00, 120.00, 130.00, 1, '2026-03-06 07:43:26', '2026-03-06 07:43:26', 1000.00),
(2, 1, 2, 2, 4, 500, 1000.00, 20.00, 1200.00, 1300.00, 1, '2026-03-06 07:43:26', '2026-03-06 07:43:26', 10000.00),
(3, 2, 3, 3, 3, 1000, 50.00, 25.00, 62.50, 650.00, 1, '2026-03-07 05:43:19', '2026-03-07 05:43:19', 5000.00),
(4, 3, 6, 4, 3, 50, 150.00, 20.00, 180.00, 97.50, 1, '2026-03-25 06:00:59', '2026-03-25 06:00:59', 750.00),
(5, 4, 41, 5, 4, 300, 350.00, 20.00, 420.00, 455.00, 1, '2026-03-28 04:23:34', '2026-03-28 04:23:34', 3500.00);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_payments`
--

CREATE TABLE `purchase_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `method` varchar(50) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `is_reversed` tinyint(1) NOT NULL DEFAULT 0,
  `reversed_at` timestamp NULL DEFAULT NULL,
  `reversed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `account_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_payments`
--

INSERT INTO `purchase_payments` (`id`, `purchase_id`, `supplier_id`, `payment_date`, `amount`, `method`, `reference`, `remarks`, `is_reversed`, `reversed_at`, `reversed_by`, `account_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 2, 6, '2026-03-07', 5000.00, 'bank', NULL, NULL, 0, NULL, NULL, 56, 2, '2026-03-07 05:43:19', '2026-03-07 05:43:19'),
(2, 3, 4, '2026-03-25', 847.50, 'cash', NULL, NULL, 0, NULL, NULL, 3, 2, '2026-03-25 06:00:59', '2026-03-25 06:00:59'),
(3, 4, 12, '2026-03-28', 3955.00, 'cash', NULL, NULL, 0, NULL, NULL, 3, 2, '2026-03-28 04:23:34', '2026-03-28 04:23:34');

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token` varchar(64) NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token`, `revoked`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 3, '997ce8c5f4240ac9db2beb9ddd2868c67c603dcf1ae0ea89ea08750e7610a003', 0, '2026-01-01 03:42:00', '2025-12-02 03:42:00', '2025-12-02 03:42:00'),
(2, 3, 'ae97638d25a5b9422ee0b0995f0d699502e580b3ef4fce59b029b2f72aa3d4e4', 0, '2026-01-01 03:45:05', '2025-12-02 03:45:05', '2025-12-02 03:45:05'),
(3, 2, '0dfcddc0436c48159254a20ba5d9514b41235d81d264afe961ee1095cbee6de1', 0, '2026-01-03 01:19:07', '2025-12-04 01:19:07', '2025-12-04 01:19:07'),
(4, 2, '3dabbaad0b9c16b2a789578f8b08a32c86b94a50a06c25f66cde578eaaa9d43e', 0, '2026-01-03 03:36:39', '2025-12-04 03:36:39', '2025-12-04 03:36:39'),
(5, 2, '29f64a8e1f480ee5019671ec98b51403fbb8acdf7a55e0a68561e432cb1c1a84', 0, '2026-01-03 04:34:19', '2025-12-04 04:34:19', '2025-12-04 04:34:19'),
(6, 3, '4926f29d911420f7eca2bcc8323e6ae6b39db3975b313fb69583a7d09ff24548', 0, '2026-01-03 04:34:43', '2025-12-04 04:34:43', '2025-12-04 04:34:43'),
(7, 2, '1cc1a3510b06ec97753509813d22d01fea70db29a23e4e8573f4aeb4a8d74bc1', 0, '2026-01-03 22:51:42', '2025-12-04 22:51:42', '2025-12-04 22:51:42'),
(8, 2, 'dae35a24cd6ae382041cbbe9c8e243a52d7358aef6cc7d1cb65cfa99189ae9c0', 0, '2026-01-03 23:15:08', '2025-12-04 23:15:08', '2025-12-04 23:15:08'),
(9, 2, 'b117ff3f48b3020e85b52081aa05c99e688c05d70a29d3c84c87763477339443', 0, '2026-01-03 23:18:31', '2025-12-04 23:18:31', '2025-12-04 23:18:31'),
(10, 2, '503698b3ae7847fbf9ff060bf5629fa6228f074e2a81cee969c022855b3fa461', 0, '2026-01-03 23:26:38', '2025-12-04 23:26:38', '2025-12-04 23:26:38'),
(11, 2, '20792600244fed875fb156cebbbb650c4f1eefd5a84691e268c2a68d31f48f50', 0, '2026-01-03 23:27:56', '2025-12-04 23:27:56', '2025-12-04 23:27:56'),
(12, 2, '13709ef9232a600be1699dff8941fe64cd22ae7998392bbd29fb3d7a102698f6', 0, '2026-01-03 23:41:54', '2025-12-04 23:41:54', '2025-12-04 23:41:54'),
(13, 2, '9bd80301807db4eee343839f9570a7fd9a5c3af54a6dc832edce5942fbe60bb0', 0, '2026-01-03 23:47:52', '2025-12-04 23:47:52', '2025-12-04 23:47:52'),
(14, 2, 'a851108a9a4a93e846fe6387c1232add17c7fe8375239866c75bae937ff27bbe', 0, '2026-01-04 00:01:53', '2025-12-05 00:01:53', '2025-12-05 00:01:53'),
(15, 2, 'bff55e839bac5c2fc98b0575d932b698c5439b62207e2c9781f5d2a7ceac5b11', 0, '2026-01-04 00:06:18', '2025-12-05 00:06:18', '2025-12-05 00:06:18'),
(16, 2, '66a9208042b6e310dbb6cbf1303715e6b8e6a2aa5276be525a1dabe4f326a390', 0, '2026-01-04 00:23:22', '2025-12-05 00:23:22', '2025-12-05 00:23:22'),
(17, 2, 'c600dc0627e8d4d30d82477cd2e6b6ca34f2d51b3968f7d16691de2fad6c0b8b', 0, '2026-01-04 01:00:29', '2025-12-05 01:00:29', '2025-12-05 01:00:29'),
(18, 2, 'caf103edd201c4b8286eae08201f87cf10002ba6395eac10be2f475ad7b17ccb', 0, '2026-01-04 01:44:34', '2025-12-05 01:44:34', '2025-12-05 01:44:34'),
(19, 2, '46a41980f32cf853ba6481c7d2e9ee986334113ac04ad2063a2e8524788b6614', 0, '2026-01-04 02:18:58', '2025-12-05 02:18:58', '2025-12-05 02:18:58'),
(20, 2, 'a478aef911c135d5a3d99fe8602cd23d05a9b438e8a9bd180d4bfa81ba4d2be2', 0, '2026-01-10 00:34:50', '2025-12-11 00:34:50', '2025-12-11 00:34:50'),
(21, 2, 'c6eb3295953b9fa3acce93db9e6155c8491227511283869bea28cb70e8e6d5a7', 0, '2026-01-10 00:34:54', '2025-12-11 00:34:54', '2025-12-11 00:34:54'),
(22, 2, '44c63c6cfd99064097b527741ff3f664c8a1e83652a423a2fcbfb93e1c69454b', 0, '2026-01-10 02:29:57', '2025-12-11 02:29:57', '2025-12-11 02:29:57'),
(23, 2, '2547b2f4716ed2e3e9ed205308661b8dcbd0acbaee38dbe9d7db015234f690ec', 0, '2026-01-12 02:12:10', '2025-12-13 02:12:10', '2025-12-13 02:12:10'),
(24, 2, '7dc9d2532d41dbca128aaf4183124a53d9f5ed66fb6a9f74910f23638d69380c', 0, '2026-01-13 07:33:28', '2025-12-14 07:33:28', '2025-12-14 07:33:28'),
(25, 2, '00124e13f6759fe42b2ef77e3df310b06fac64f5d7dd3d1f96dc9ac9f743efdd', 0, '2026-01-22 02:31:17', '2025-12-23 02:31:17', '2025-12-23 02:31:17'),
(26, 2, '0648964ccba2d9327261a5c18fa925ebbe4e498719253d39a860e1fc1fc1450f', 0, '2026-01-22 23:14:02', '2025-12-23 23:14:02', '2025-12-23 23:14:02'),
(27, 2, '91085d9786d9f887eb9725f73f12b8e52164c02f50895f6f820ed0bd63254b73', 0, '2026-02-06 07:23:15', '2026-01-07 07:23:15', '2026-01-07 07:23:15'),
(28, 2, '2509b31f03953803e18d9c92b98e0b3c3feead22501a714c40e2de69edb0b990', 0, '2026-02-08 06:12:20', '2026-01-09 06:12:20', '2026-01-09 06:12:20'),
(29, 2, 'f42849bc807fd7785f220d212185df7334bda33c953d27107913ce585198f89d', 0, '2026-02-11 07:31:49', '2026-01-12 07:31:49', '2026-01-12 07:31:49'),
(30, 2, '45ac24a324c2bb34783f6726b2529c79fadd4cc83163d009d12b43a79cfcd729', 0, '2026-04-04 06:39:06', '2026-03-05 06:39:06', '2026-03-05 06:39:06'),
(31, 2, '16a655aa46119b7761f2fb7c550be0d2ddb803e10772955bbf81d5dfb1685159', 0, '2026-04-24 05:49:39', '2026-03-25 05:49:39', '2026-03-25 05:49:39'),
(32, 2, '2c49e4bb89a9d798374ed9235162ffcb760215610b5ae6ca2c029548eab28046', 0, '2026-04-27 04:14:11', '2026-03-28 04:14:11', '2026-03-28 04:14:11'),
(33, 4, '129e94f7404bcd4ea9a57b71251ecff02e3f95ea8348494b4eec78572c8d858c', 0, '2026-05-20 05:47:51', '2026-04-20 05:47:51', '2026-04-20 05:47:51'),
(34, 4, 'beaca7ffc3b96c621040e5ee7d3d5b593da9fc9037f2f88db596915cf6323092', 0, '2026-05-20 14:20:56', '2026-04-20 14:20:56', '2026-04-20 14:20:56'),
(35, 4, 'c221ddc20d18a7d8b6d750522d722bea16c031e036e91eecb9b9a85ad383c739', 0, '2026-05-20 14:21:05', '2026-04-20 14:21:05', '2026-04-20 14:21:05'),
(36, 4, 'e55bff1ec594de458c4510f708a80d2aad058c3722da8afa1be8e8f882aa1c94', 0, '2026-05-20 14:22:37', '2026-04-20 14:22:37', '2026-04-20 14:22:37');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(2, 'inventory', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(3, 'accountant', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(4, 'sales', 'web', '2025-12-02 03:05:49', '2025-12-02 03:05:49'),
(5, 'viewer', 'web', '2025-12-02 03:05:50', '2025-12-02 03:05:50');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(2, 1),
(2, 2),
(2, 5),
(3, 1),
(3, 2),
(4, 1),
(4, 2),
(5, 1),
(5, 2),
(6, 1),
(6, 2),
(6, 5),
(7, 1),
(7, 2),
(8, 1),
(8, 2),
(8, 5),
(9, 1),
(9, 2),
(10, 1),
(10, 2),
(10, 5),
(11, 1),
(11, 2),
(12, 1),
(12, 2),
(12, 5),
(13, 1),
(13, 2),
(14, 1),
(14, 2),
(15, 1),
(15, 2),
(16, 1),
(16, 2),
(17, 1),
(17, 2),
(18, 1),
(18, 2),
(19, 1),
(19, 2),
(20, 1),
(20, 2),
(21, 1),
(21, 2),
(22, 1),
(22, 2),
(22, 5),
(23, 1),
(23, 2),
(24, 1),
(24, 2),
(24, 5),
(25, 1),
(25, 2),
(26, 1),
(26, 2),
(26, 5),
(27, 1),
(27, 2),
(28, 1),
(28, 2),
(29, 1),
(29, 2),
(30, 1),
(30, 2),
(31, 1),
(31, 2),
(31, 3),
(31, 5),
(32, 1),
(32, 2),
(32, 3),
(33, 1),
(33, 2),
(33, 3),
(34, 1),
(34, 2),
(34, 3),
(35, 1),
(35, 4),
(35, 5),
(36, 1),
(36, 4),
(37, 1),
(37, 4),
(37, 5),
(38, 1),
(38, 4),
(39, 1),
(39, 4),
(40, 1),
(40, 4),
(41, 1),
(41, 3),
(41, 4),
(41, 5),
(42, 1),
(42, 3),
(42, 4),
(43, 1),
(43, 3),
(43, 4),
(44, 1),
(44, 3),
(44, 4),
(45, 1),
(45, 3),
(46, 1),
(46, 3),
(47, 1),
(47, 3),
(47, 5),
(48, 1),
(48, 3),
(49, 1),
(49, 3),
(49, 5),
(50, 1),
(50, 3),
(51, 1),
(51, 3),
(52, 1),
(52, 3),
(53, 1),
(53, 3),
(54, 1),
(54, 3),
(55, 1),
(55, 3),
(56, 1),
(56, 3),
(57, 1),
(57, 3),
(58, 1),
(58, 3),
(59, 1),
(59, 3),
(60, 1),
(60, 3),
(61, 1),
(61, 3),
(62, 1),
(62, 3),
(63, 1),
(63, 3),
(64, 1),
(64, 3),
(65, 1),
(65, 3),
(66, 1),
(66, 3),
(67, 1),
(67, 3),
(68, 1),
(68, 3),
(69, 1),
(69, 3),
(69, 5),
(70, 1),
(70, 3),
(71, 1),
(71, 3),
(71, 5),
(72, 1),
(72, 3),
(72, 5),
(73, 1),
(73, 3),
(73, 5),
(74, 1),
(74, 3),
(74, 5),
(75, 1),
(75, 3),
(75, 5),
(76, 1),
(76, 3),
(76, 5),
(77, 1),
(78, 1),
(79, 1),
(80, 1),
(81, 1),
(82, 1),
(83, 1),
(84, 1),
(84, 5),
(85, 1),
(86, 1),
(87, 1),
(88, 1);

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `walkin_name` text DEFAULT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `invoice_date` date NOT NULL,
  `gross_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `vat_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('open','partial','paid','cancelled') DEFAULT 'open',
  `remarks` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `walkin_name`, `customer_id`, `invoice_no`, `invoice_date`, `gross_amount`, `vat_amount`, `discount_amount`, `total_amount`, `status`, `remarks`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Yogesh Kamti', 13, 'SAL-202603-000001', '2026-03-07', 2400.00, 312.00, 712.00, 2000.00, 'paid', NULL, 2, '2026-03-07 04:01:52', '2026-03-07 04:01:52'),
(2, 'Saroj Joshi', 13, 'SAL-202603-000002', '2026-03-07', 560.00, 72.80, 4.80, 628.00, 'paid', NULL, 2, '2026-03-07 07:48:12', '2026-03-07 07:48:12'),
(3, 'Saroj', 13, 'SAL-202603-000003', '2026-03-28', 70.00, 9.10, 9.10, 70.00, 'paid', NULL, 2, '2026-03-28 04:26:27', '2026-03-28 04:26:27');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sale_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `hs_code` varchar(255) DEFAULT NULL,
  `batch_id` bigint(20) UNSIGNED NOT NULL,
  `original_price` decimal(15,2) DEFAULT NULL,
  `discount_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `selling_price` decimal(15,2) NOT NULL,
  `vat_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `vat_included` tinyint(1) DEFAULT 0,
  `inventory_value` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `hs_code`, `batch_id`, `original_price`, `discount_amount`, `unit_id`, `quantity`, `selling_price`, `vat_amount`, `vat_included`, `inventory_value`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, 1, 120.00, 0.00, 3, 10, 120.00, 15.60, 1, 120.00, '2026-03-07 04:01:52', '2026-03-07 04:01:52'),
(2, 1, 2, '3099', 2, 1200.00, 60.00, 4, 100, 1140.00, 296.40, 1, 2280.00, '2026-03-07 04:01:52', '2026-03-07 04:01:52'),
(3, 2, 3, '3090', 3, 62.50, 2.50, 3, 10, 60.00, 7.80, 1, 60.00, '2026-03-07 07:48:12', '2026-03-07 07:48:12'),
(4, 2, 2, '3099', 2, 120.00, 20.00, 3, 25, 100.00, 65.00, 1, 500.00, '2026-03-07 07:48:12', '2026-03-07 07:48:12'),
(5, 3, 41, '101', 5, 14.00, 0.00, 3, 5, 14.00, 9.10, 1, 70.00, '2026-03-28 04:26:27', '2026-03-28 04:26:27');

-- --------------------------------------------------------

--
-- Table structure for table `sale_payments`
--

CREATE TABLE `sale_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sale_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `method` varchar(20) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `account_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `is_reversed` tinyint(1) DEFAULT 0,
  `reversed_at` timestamp NULL DEFAULT NULL,
  `reversed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_payments`
--

INSERT INTO `sale_payments` (`id`, `sale_id`, `customer_id`, `payment_date`, `amount`, `method`, `reference`, `remarks`, `account_id`, `created_by`, `is_reversed`, `reversed_at`, `reversed_by`, `created_at`, `updated_at`) VALUES
(1, 1, 13, '2026-03-07', 2000.00, 'cash', NULL, NULL, 3, 2, 0, NULL, NULL, '2026-03-07 04:01:52', '2026-03-07 04:01:52'),
(2, 2, 13, '2026-03-07', 628.00, 'cash', NULL, NULL, 3, 2, 0, NULL, NULL, '2026-03-07 07:48:12', '2026-03-07 07:48:12'),
(3, 3, 13, '2026-03-28', 70.00, 'cash', NULL, NULL, 3, 2, 0, NULL, NULL, '2026-03-28 04:26:27', '2026-03-28 04:26:27');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('7JiGVPijADkqIVmcEJwmK8lbX6aDrJaFu0kZGuo3', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoicTU1ZldRekxLT0VWblRCSWJnYTgxRTY1R3Jwb2VRSVZSb0l1bFhiRyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772692691);

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `type` enum('stock_in','stock_out','purchase','sale','adjustment_in','adjustment_out','return_sale','return_purchase','expiry_out','opening') NOT NULL,
  `quantity` int(11) NOT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reference_type` varchar(255) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `performed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `journal_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `product_id`, `batch_id`, `location_id`, `type`, `quantity`, `reference_id`, `reference_type`, `cost_price`, `selling_price`, `remarks`, `performed_by`, `created_at`, `updated_at`, `journal_id`) VALUES
(1, 1, 1, 1, 'purchase', 100, 1, 'App\\Models\\Purchase', 100.00, 120.00, 'Purchase Invoice PUR-202603-000001', 2, '2026-03-06 07:43:26', '2026-03-06 07:43:26', 1),
(2, 2, 2, 1, 'purchase', 500, 1, 'App\\Models\\Purchase', 1000.00, 1200.00, 'Purchase Invoice PUR-202603-000001', 2, '2026-03-06 07:43:26', '2026-03-06 07:43:26', 1),
(3, 1, 1, NULL, 'sale', -10, 1, 'App\\Models\\Sale', NULL, NULL, NULL, 2, '2026-03-07 04:01:52', '2026-03-07 04:01:52', NULL),
(4, 2, 2, NULL, 'sale', -100, 1, 'App\\Models\\Sale', NULL, NULL, NULL, 2, '2026-03-07 04:01:52', '2026-03-07 04:01:52', NULL),
(5, 3, 3, 1, 'purchase', 1000, 2, 'App\\Models\\Purchase', 50.00, 62.50, 'Purchase Invoice PUR-202603-000002', 2, '2026-03-07 05:43:19', '2026-03-07 05:43:19', 13),
(6, 3, 3, NULL, 'sale', -10, 2, 'App\\Models\\Sale', NULL, NULL, NULL, 2, '2026-03-07 07:48:12', '2026-03-07 07:48:12', NULL),
(7, 2, 2, NULL, 'sale', -25, 2, 'App\\Models\\Sale', NULL, NULL, NULL, 2, '2026-03-07 07:48:12', '2026-03-07 07:48:12', NULL),
(8, 6, 4, 1, 'purchase', 50, 3, 'App\\Models\\Purchase', 150.00, 180.00, 'Purchase Invoice PUR-202603-000003', 2, '2026-03-25 06:00:59', '2026-03-25 06:00:59', 17),
(9, 41, 5, 14, 'purchase', 300, 4, 'App\\Models\\Purchase', 350.00, 420.00, 'Purchase Invoice PUR-202603-000004', 2, '2026-03-28 04:23:34', '2026-03-28 04:23:34', 19),
(10, 41, 5, NULL, 'sale', -5, 3, 'App\\Models\\Sale', NULL, NULL, NULL, 2, '2026-03-28 04:26:27', '2026-03-28 04:26:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `firm_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `pan_no` varchar(255) DEFAULT NULL,
  `vat_no` varchar(255) DEFAULT NULL,
  `is_vat_registered` tinyint(1) NOT NULL DEFAULT 0,
  `logo` varchar(255) DEFAULT NULL,
  `currency` varchar(255) NOT NULL DEFAULT 'NPR',
  `currency_symbol` varchar(255) NOT NULL DEFAULT 'Rs.',
  `fiscal_year_start` varchar(255) DEFAULT NULL,
  `fiscal_year_end` varchar(255) DEFAULT NULL,
  `receipt_header` text DEFAULT NULL,
  `receipt_footer` text DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `firm_name`, `address`, `contact_number`, `email`, `pan_no`, `vat_no`, `is_vat_registered`, `logo`, `currency`, `currency_symbol`, `fiscal_year_start`, `fiscal_year_end`, `receipt_header`, `receipt_footer`, `meta`, `created_at`, `updated_at`) VALUES
(1, 'My Pharmacy', 'Dhangadhi, Kailali', '9878784646', 'support@mypharmacy.com', '6090894847', '6090894847', 1, 'logos/HN43RKihq4U6lEZxZzsBiSzPOz3u4ja9uLlk2eTo.png', 'NPR', 'Rs.', NULL, NULL, NULL, NULL, '[]', '2026-03-05 16:50:48', '2026-03-06 07:27:49');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `short_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `name`, `short_code`, `created_at`, `updated_at`) VALUES
(1, 'Tablet', 'TAB', '2026-03-05 15:13:50', '2026-03-05 15:13:50'),
(2, 'Capsule', 'CAP', '2026-03-05 15:13:50', '2026-03-05 15:13:50'),
(3, 'Strip', 'STR', '2026-03-05 15:13:50', '2026-03-05 15:13:50'),
(4, 'Box', 'BOX', '2026-03-05 15:13:50', '2026-03-05 15:13:50'),
(5, 'Bottle', 'BTL', '2026-03-05 15:13:50', '2026-03-05 15:13:50'),
(6, 'Tube', 'TBE', '2026-03-05 15:13:50', '2026-03-05 15:13:50'),
(7, 'Vial', 'VIL', '2026-03-05 15:13:50', '2026-03-05 15:13:50'),
(8, 'Ampoule', 'AMP', '2026-03-05 15:13:50', '2026-03-05 15:13:50'),
(9, 'Piece', 'PCS', '2026-03-05 15:13:50', '2026-03-05 15:13:50'),
(10, 'Sachet', 'SAC', '2026-03-05 15:13:50', '2026-03-05 15:13:50'),
(11, 'Packet', 'PKT', '2026-03-05 15:13:50', '2026-03-05 15:13:50'),
(12, 'Kit', 'KIt', '2026-03-05 15:13:50', '2026-03-05 15:13:50');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'staff'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `role`) VALUES
(1, 'Admin User', 'admin@bbmedx.com', NULL, '$2y$12$90KmJf6lsMy4po00Y9Kp3OYHAgewsuoscMYTT0csF9QvwSNH8GaK.', NULL, '2025-12-02 03:05:50', '2025-12-02 03:05:50', 'staff'),
(2, 'BBMedX Admin', 'admin@bbmedx2.com', NULL, '$2y$12$xa1MiE/p7t7Ed4LF/3YZWuKI9A.WDJaYpCTeSA9CnxRYPsQ5CEyp6', NULL, '2025-12-02 03:19:27', '2025-12-02 03:19:27', 'admin'),
(3, 'BBMedX Admin', 'admin@bbmed.com', NULL, '$2y$12$voWpCm9nbxeI1prKdGEhKeJ7/SrcPk3rh7SQy./Q7h14CGGDEj0Ce', NULL, '2025-12-02 03:41:49', '2025-12-02 03:41:49', 'admin'),
(4, 'Admin User', 'abcd@gmail.com', NULL, '$2y$12$xa1MiE/p7t7Ed4LF/3YZWuKI9A.WDJaYpCTeSA9CnxRYPsQ5CEyp6', NULL, '2025-12-02 03:05:50', '2025-12-02 03:05:50', 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `dictionary_categories`
--
ALTER TABLE `dictionary_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `dictionary_items`
--
ALTER TABLE `dictionary_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dictionary_values`
--
ALTER TABLE `dictionary_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `fiscal_years`
--
ALTER TABLE `fiscal_years`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_fy_name` (`name`);

--
-- Indexes for table `inventory_account_mappings`
--
ALTER TABLE `inventory_account_mappings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `journals`
--
ALTER TABLE `journals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `journal_no` (`journal_no`),
  ADD KEY `idx_journal_date` (`journal_date`);

--
-- Indexes for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `journal_id` (`journal_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `idx_journal_entries_party` (`party_id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `locations_parent_id_foreign` (`parent_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `parties`
--
ALTER TABLE `parties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `fk_party_account` (`account_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_allocations`
--
ALTER TABLE `payment_allocations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_sku_unique` (`sku`),
  ADD KEY `products_category_id_foreign` (`category_id`),
  ADD KEY `products_unit_id_foreign` (`unit_id`);

--
-- Indexes for table `product_batches`
--
ALTER TABLE `product_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_batches_product_id_foreign` (`product_id`),
  ADD KEY `product_batches_batch_no_index` (`batch_no`),
  ADD KEY `product_batches_purchase_id_foreign` (`purchase_id`) USING BTREE;

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_categories_parent_id_foreign` (`parent_id`);

--
-- Indexes for table `product_field_definitions`
--
ALTER TABLE `product_field_definitions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_field_definitions_key_unique` (`key`);

--
-- Indexes for table `product_field_values`
--
ALTER TABLE `product_field_values`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_field_unique` (`product_id`,`field_definition_id`),
  ADD KEY `product_field_values_field_definition_id_foreign` (`field_definition_id`),
  ADD KEY `product_field_values_value_string_index` (`value_string`),
  ADD KEY `product_field_values_value_int_index` (`value_int`),
  ADD KEY `product_field_values_value_decimal_index` (`value_decimal`),
  ADD KEY `product_field_values_value_date_index` (`value_date`),
  ADD KEY `product_field_values_value_bool_index` (`value_bool`);

--
-- Indexes for table `product_units`
--
ALTER TABLE `product_units`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_units_product_id_foreign` (`product_id`),
  ADD KEY `product_units_unit_id_foreign` (`unit_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_purchase_supplier` (`supplier_id`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pi_purchase` (`purchase_id`),
  ADD KEY `fk_pi_product` (`product_id`),
  ADD KEY `fk_pi_batch` (`batch_id`),
  ADD KEY `purchase_items_unit_id_foreign` (`unit_id`);

--
-- Indexes for table `purchase_payments`
--
ALTER TABLE `purchase_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_purchase_payments_purchase` (`purchase_id`),
  ADD KEY `fk_purchase_payments_supplier` (`supplier_id`),
  ADD KEY `fk_purchase_payments_account` (`account_id`),
  ADD KEY `fk_purchase_payments_created_by` (`created_by`),
  ADD KEY `fk_purchase_payments_reversed_by` (`reversed_by`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `refresh_tokens_token_unique` (`token`),
  ADD KEY `refresh_tokens_user_id_foreign` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`),
  ADD KEY `idx_sales_customer` (`customer_id`),
  ADD KEY `idx_sales_date` (`invoice_date`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sale_items_sale` (`sale_id`),
  ADD KEY `idx_sale_items_product` (`product_id`),
  ADD KEY `sale_items_unit_id_foreign` (`unit_id`);

--
-- Indexes for table `sale_payments`
--
ALTER TABLE `sale_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sale_payment_sale` (`sale_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_movements_batch_id_foreign` (`batch_id`),
  ADD KEY `stock_movements_performed_by_foreign` (`performed_by`),
  ADD KEY `stock_movements_product_id_batch_id_type_index` (`product_id`,`batch_id`,`type`),
  ADD KEY `journal_id` (`journal_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `dictionary_categories`
--
ALTER TABLE `dictionary_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `dictionary_items`
--
ALTER TABLE `dictionary_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dictionary_values`
--
ALTER TABLE `dictionary_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=200;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fiscal_years`
--
ALTER TABLE `fiscal_years`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_account_mappings`
--
ALTER TABLE `inventory_account_mappings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `journals`
--
ALTER TABLE `journals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `journal_entries`
--
ALTER TABLE `journal_entries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `parties`
--
ALTER TABLE `parties`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_allocations`
--
ALTER TABLE `payment_allocations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `product_batches`
--
ALTER TABLE `product_batches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `product_field_definitions`
--
ALTER TABLE `product_field_definitions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `product_field_values`
--
ALTER TABLE `product_field_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT for table `product_units`
--
ALTER TABLE `product_units`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `purchase_payments`
--
ALTER TABLE `purchase_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sale_payments`
--
ALTER TABLE `sale_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `accounts_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `accounts` (`id`);

--
-- Constraints for table `dictionary_values`
--
ALTER TABLE `dictionary_values`
  ADD CONSTRAINT `dictionary_values_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `dictionary_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD CONSTRAINT `fk_journal_party` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`),
  ADD CONSTRAINT `journal_entries_ibfk_1` FOREIGN KEY (`journal_id`) REFERENCES `journals` (`id`),
  ADD CONSTRAINT `journal_entries_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`);

--
-- Constraints for table `locations`
--
ALTER TABLE `locations`
  ADD CONSTRAINT `locations_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `parties`
--
ALTER TABLE `parties`
  ADD CONSTRAINT `fk_party_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_batches`
--
ALTER TABLE `product_batches`
  ADD CONSTRAINT `product_batches_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD CONSTRAINT `product_categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `product_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_field_values`
--
ALTER TABLE `product_field_values`
  ADD CONSTRAINT `product_field_values_field_definition_id_foreign` FOREIGN KEY (`field_definition_id`) REFERENCES `product_field_definitions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_field_values_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_units`
--
ALTER TABLE `product_units`
  ADD CONSTRAINT `product_units_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_units_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `fk_purchase_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `parties` (`id`);

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `fk_pi_batch` FOREIGN KEY (`batch_id`) REFERENCES `product_batches` (`id`),
  ADD CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_pi_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `purchase_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`);

--
-- Constraints for table `purchase_payments`
--
ALTER TABLE `purchase_payments`
  ADD CONSTRAINT `fk_purchase_payments_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`),
  ADD CONSTRAINT `fk_purchase_payments_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_purchase_payments_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_purchase_payments_reversed_by` FOREIGN KEY (`reversed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_purchase_payments_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `parties` (`id`);

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`);

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `product_batches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`journal_id`) REFERENCES `journals` (`id`),
  ADD CONSTRAINT `stock_movements_performed_by_foreign` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
