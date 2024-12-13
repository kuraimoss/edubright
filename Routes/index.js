// Mengimpor routes dari berbagai modul
const authRoutes = require('./auth'); // Routes untuk otentikasi pengguna
const pythonRoutes = require('./pythonScriptRunner'); // Routes untuk menjalankan skrip Python
const feedbackRoutes = require('./feedback'); // Routes untuk menangani feedback pengguna
const getData = require('./getData'); // Routes untuk mengambil data

// Menyusun dan mengekspor semua routes dari modul-modul di atas dalam satu array
module.exports = [
    ...authRoutes, // Menambahkan routes dari authRoutes
    ...pythonRoutes, // Menambahkan routes dari pythonRoutes
    ...feedbackRoutes, // Menambahkan routes dari feedbackRoutes
    ...getData // Menambahkan routes dari getData
];
