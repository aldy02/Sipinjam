-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 04, 2026 at 07:41 AM
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
-- Database: `sipinjam`
--

-- --------------------------------------------------------

--
-- Table structure for table `equipment`
--

CREATE TABLE `equipment` (
  `equipment_id` int(11) NOT NULL,
  `kode_barang` varchar(50) NOT NULL,
  `nama` varchar(150) NOT NULL,
  `kondisi` varchar(50) NOT NULL DEFAULT 'baik',
  `status` enum('tersedia','dipinjam','maintenance') NOT NULL DEFAULT 'tersedia',
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `equipment`
--

INSERT INTO `equipment` (`equipment_id`, `kode_barang`, `nama`, `kondisi`, `status`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 'BRNG-001', 'Laptop Asus X441', 'baik', 'tersedia', 'Laptop untuk kebutuhan presentasi', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(2, 'BRNG-002', 'Laptop Asus X441', 'baik', 'tersedia', 'Laptop untuk kebutuhan presentasi', '2026-08-21 01:37:38', '2026-09-02 01:17:05'),
(3, 'BRNG-003', 'Laptop Lenovo ThinkPad E14', 'baik', 'dipinjam', 'Laptop untuk kebutuhan mobile kerja', '2026-08-21 01:37:38', '2026-09-02 01:15:56'),
(4, 'BRNG-004', 'Proyektor Epson EB-X05', 'rusak ringan', 'tersedia', 'Proyektor ruang rapat', '2026-08-21 01:37:38', '2026-08-23 23:50:39'),
(5, 'BRNG-005', 'Proyektor BenQ MS550', 'baik', 'tersedia', 'Proyektor ruang training', '2026-08-21 01:37:38', '2026-08-23 23:48:56'),
(6, 'BRNG-006', 'Kamera Sony Alpha a6400', 'baik', 'tersedia', 'Kamera untuk dokumentasi kegiatan', '2026-08-21 01:37:38', '2026-09-01 23:48:37'),
(7, 'BRNG-007', 'Kamera Canon EOS 6D Mark II', 'baik', 'tersedia', 'Kamera untuk dokumentasi acara', '2026-08-21 01:37:38', '2026-08-24 01:55:06'),
(8, 'BRNG-008', 'Tangga Lipat Aluminium', 'rusak ringan', 'tersedia', 'Tangga lipat 3 meter', '2026-08-21 01:37:38', '2026-08-24 02:25:49'),
(9, 'BRNG-009', 'Mikrofon Sony ECM-V1 Wireless', 'baik', 'tersedia', 'Mikrofon wireless untuk acara', '2026-08-21 01:37:38', '2026-09-02 01:28:42'),
(10, 'BRNG-010', 'Mikrofon Shure SM58 Cable', 'rusak berat', 'maintenance', 'Mikrofon kabel untuk ruang aula', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(11, 'BRNG-011', 'Speaker JBL Xtreme 3', 'baik', 'tersedia', 'Speaker portable untuk acara outdoor', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(12, 'BRNG-012', 'UPS APC 650VA', 'baik', 'tersedia', 'UPS untuk backup daya server kecil', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(13, 'BRNG-013', 'Router Mikrotik RB750', 'baik', 'dipinjam', 'Router untuk kebutuhan jaringan sementara', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(14, 'BRNG-014', 'Switch TP-Link 8 Port', 'baik', 'tersedia', 'Switch jaringan 8 port', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(15, 'BRNG-015', 'Kabel HDMI 10 Meter', 'baik', 'tersedia', 'Kabel HDMI panjang untuk ruang aula', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(16, 'BRNG-016', 'Kabel LAN Cat6 20 Meter', 'baik', 'tersedia', 'Kabel jaringan cadangan', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(17, 'BRNG-017', 'Printer Canon Pixma G2010', 'rusak ringan', 'tersedia', 'Printer untuk kebutuhan cetak dokumen', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(18, 'BRNG-018', 'Scanner Epson L3110', 'baik', 'tersedia', 'Scanner dokumen kantor', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(19, 'BRNG-019', 'Whiteboard Portable', 'baik', 'tersedia', 'Whiteboard untuk ruang meeting', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(20, 'BRNG-020', 'Flipchart Stand', 'baik', 'tersedia', 'Stand flipchart untuk presentasi', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(21, 'BRNG-021', 'Extension Cable 10 Meter', 'baik', 'tersedia', 'Kabel roll listrik', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(22, 'BRNG-022', 'Tripod Kamera', 'baik', 'dipinjam', 'Tripod untuk kamera DSLR', '2026-08-21 01:37:38', '2026-09-01 03:36:25'),
(23, 'BRNG-023', 'Layar Proyektor Portable', 'baik', 'tersedia', 'Layar proyektor 100 inch portable', '2026-08-21 01:37:38', '2026-09-02 01:40:35'),
(24, 'BRNG-024', 'Headset Logitech H390', 'baik', 'tersedia', 'Headset untuk video conference', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(25, 'BRNG-025', 'Webcam Logitech C920', 'rusak ringan', 'tersedia', 'Webcam untuk video conference', '2026-08-21 01:37:38', '2026-08-21 01:37:38'),
(26, 'BRNG-026', 'Safety Helmet', 'baik', 'tersedia', 'Helm untuk melindungi bagian kepala saat bekerja', '2026-08-21 02:37:49', '2026-08-23 23:46:35'),
(27, 'BRNG-027', 'Kabel Terminal', 'baik', 'tersedia', '', '2026-08-21 02:51:31', '2026-08-21 02:51:31');

-- --------------------------------------------------------

--
-- Table structure for table `peminjaman`
--

CREATE TABLE `peminjaman` (
  `peminjaman_id` int(11) NOT NULL,
  `kode_peminjaman` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `equipment_id` int(11) NOT NULL,
  `kondisi_saat_pinjam` varchar(50) NOT NULL,
  `kondisi_saat_kembali` varchar(50) DEFAULT NULL,
  `lokasi_pickup` varchar(150) DEFAULT NULL,
  `lokasi_pemakaian` varchar(150) DEFAULT NULL,
  `lokasi_kembali` varchar(150) DEFAULT NULL,
  `foto_bukti_kembali` varchar(255) DEFAULT NULL,
  `tanggal_pinjam` datetime NOT NULL DEFAULT current_timestamp(),
  `tanggal_rencana_kembali` datetime DEFAULT NULL,
  `tanggal_aktual_kembali` datetime DEFAULT NULL,
  `status` enum('dipinjam','dikembalikan') NOT NULL DEFAULT 'dipinjam',
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `peminjaman`
--

INSERT INTO `peminjaman` (`peminjaman_id`, `kode_peminjaman`, `user_id`, `equipment_id`, `kondisi_saat_pinjam`, `kondisi_saat_kembali`, `lokasi_pickup`, `lokasi_pemakaian`, `lokasi_kembali`, `foto_bukti_kembali`, `tanggal_pinjam`, `tanggal_rencana_kembali`, `tanggal_aktual_kembali`, `status`, `keterangan`, `created_at`, `updated_at`) VALUES
(1, 'PJM-001', 3, 3, 'baik', NULL, 'Ruang IT Support', 'Ruang Meeting Lt. 2', NULL, NULL, '2026-08-18 09:00:00', '2026-08-25 17:00:00', NULL, 'dipinjam', 'Digunakan untuk keperluan presentasi mingguan', '2026-08-21 06:04:12', '2026-08-21 06:04:12'),
(2, 'PJM-002', 3, 7, 'rusak ringan', 'baik', 'Ruang IT Support', 'Area Outdoor PPE', 'Ruang IT Support', NULL, '2026-08-19 10:30:00', '2026-08-22 17:00:00', '2026-08-24 01:55:06', 'dikembalikan', 'Dokumentasi kegiatan unit kerja PPE', '2026-08-21 06:04:12', '2026-08-24 01:55:06'),
(3, 'PJM-003', 4, 13, 'baik', NULL, 'Gudang Peralatan IT', 'Ruang Server Lt. 1', NULL, NULL, '2026-08-17 13:15:00', '2026-08-24 17:00:00', NULL, 'dipinjam', 'Kebutuhan jaringan sementara untuk instalasi baru', '2026-08-21 06:04:12', '2026-08-21 06:04:12'),
(4, 'PJM-004', 4, 22, 'baik', 'baik', 'Gudang Peralatan IT', 'Area Outdoor PPE', 'Gudang Peralatan IT', NULL, '2026-08-20 08:45:00', '2026-08-23 17:00:00', '2026-08-26 06:36:40', 'dikembalikan', 'Digunakan bersama kamera untuk dokumentasi acara', '2026-08-21 06:04:12', '2026-08-26 06:36:40'),
(11, 'PJM-20260824-001', 3, 2, 'baik', NULL, 'Ruang Lab Komputer', 'Kantor PPE', NULL, NULL, '2026-08-24 00:09:42', '2026-09-07 00:00:00', NULL, 'dipinjam', 'Dignakan untuk kebutuhan pekerjaan', '2026-08-24 00:09:42', '2026-08-24 00:09:42'),
(12, 'PJM-20260824-002', 3, 8, 'baik', 'rusak ringan', 'Gudang', 'Gedung LSP', 'Gudang', NULL, '2026-08-24 02:25:03', '2026-08-24 00:00:00', '2026-08-24 02:25:49', 'dikembalikan', '', '2026-08-24 02:25:03', '2026-08-24 02:25:49'),
(13, 'PJM-20260826-001', 4, 22, 'baik', NULL, 'Gudang Peralatan IT', 'Gedung Wijaya', NULL, NULL, '2026-08-26 06:37:40', '2026-09-01 00:00:00', NULL, 'dipinjam', 'Digunakan untuk dokumentasi kegiatan', '2026-08-26 06:37:40', '2026-08-26 06:37:40'),
(14, 'PJM-20260902-001', 3, 6, 'baik', 'baik', 'Ruang Multimedia', 'Pabrik 5', 'Ruang Multimedia', '/uploads/bukti-pengembalian/bukti-14-1788306517045-214048664.jpg', '2026-09-01 23:47:40', '2026-09-03 00:00:00', '2026-09-01 23:48:37', 'dikembalikan', 'Buat dokumentasi', '2026-09-01 23:47:40', '2026-09-01 23:48:37'),
(15, 'PJM-20260902-002', 3, 23, 'baik', 'baik', 'Ruang Lab Komputer', 'Gedung LSP', 'Ruang Lab Komputer', '/uploads/bukti-pengembalian/bukti-15-1788312936534-760754749.jpg', '2026-09-02 01:32:59', '2026-09-04 00:00:00', '2026-09-02 01:35:36', 'dikembalikan', 'Untuk Kegiatan Pelatihan Aspen', '2026-09-02 01:32:59', '2026-09-02 01:41:12');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `npk` varchar(30) NOT NULL,
  `email` varchar(150) NOT NULL,
  `jabatan` varchar(100) DEFAULT NULL,
  `pe_pabrik` enum('Pabrik-2','Pabrik-3','Pabrik-4','Pabrik-1A','Pabrik-5','Pabrik-6','PHP') DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('karyawan','admin') NOT NULL DEFAULT 'karyawan',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `nama`, `npk`, `email`, `jabatan`, `pe_pabrik`, `password`, `role`, `reset_token`, `reset_token_expires`, `created_at`, `updated_at`, `is_active`) VALUES
(1, 'Admin SIPINJAM', 'ADM-0001', 'sipinjam.ppe@gmail.com', 'Administrator', NULL, '$2b$10$QVyRADezkATRxCObzCQ/ru8536PH9RvLHGaj/brW2y188FsiKwdO.', 'admin', NULL, NULL, '2026-08-21 01:37:18', '2026-08-21 01:37:18', 1),
(3, 'Aldy Rahman', '1234567890', 'aldy.rahman02@gmail.com', 'Staff Teknologi Informasi Untuk Operasional Pabrik', 'PHP', '$2b$10$Ji0.UgVH5o7NwDDPWHnKneIFgw3FwPd8i0tRvHXbvz6R.2CCnSoRm', 'karyawan', NULL, NULL, '2026-08-21 02:14:47', '2026-08-31 22:59:57', 1),
(4, 'User2', '0987654321', 'user02.space@gmail.com', 'Staff Digitalisasi', 'Pabrik-6', '$2b$10$iMRVjFd7I0lNndFxSr0eieStHL2VHSce05PeJl1LXLxRwa1Wy2oMC', 'karyawan', NULL, NULL, '2026-08-21 06:02:08', '2026-09-02 02:01:04', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `equipment`
--
ALTER TABLE `equipment`
  ADD PRIMARY KEY (`equipment_id`),
  ADD UNIQUE KEY `kode_barang` (`kode_barang`);

--
-- Indexes for table `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD PRIMARY KEY (`peminjaman_id`),
  ADD UNIQUE KEY `kode_peminjaman` (`kode_peminjaman`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `equipment_id` (`equipment_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `nok` (`npk`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `equipment`
--
ALTER TABLE `equipment`
  MODIFY `equipment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `peminjaman`
--
ALTER TABLE `peminjaman`
  MODIFY `peminjaman_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD CONSTRAINT `peminjaman_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `peminjaman_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
