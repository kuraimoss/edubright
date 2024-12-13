const mysql = require("mysql2"); // Impor library mysql2 untuk koneksi database

// Buat connection pool untuk manajemen koneksi database
const pool = mysql.createPool({
  host: "34.128.81.134", // Alamat host database
  user: "edubright_user", // Username untuk koneksi database
  password: "KURA123@KURA", // Password untuk koneksi database
  database: "edubright_db", // Nama database yang digunakan
  
  // Opsi konfigurasi connection pool
  waitForConnections: true, // Mengaktifkan antrian koneksi jika semua koneksi sedang digunakan
  connectionLimit: 10, // Jumlah maksimum koneksi yang dapat dibuat dalam pool
  queueLimit: 0, // Tidak ada batasan untuk antrian koneksi (0 berarti unlimited)
});

// Ekspor pool dengan dukungan Promise untuk memudahkan penggunaan async/await
module.exports = pool.promise();