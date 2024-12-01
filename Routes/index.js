const authRoutes = require('./auth');
const pythonRoutes = require('./pythonScriptRunner');  // Import route baru untuk menjalankan skrip Python

module.exports = [
    ...authRoutes,
    ...pythonRoutes  // Menambahkan route untuk prediksi menggunakan Python
];
