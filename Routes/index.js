const authRoutes = require('./auth');
const runPythonScript = require('./pythonScriptRunner');  // Import route baru untuk menjalankan skrip Python

module.exports = [
    ...authRoutes,
    ...runPythonScript  // Menambahkan route untuk prediksi menggunakan Python
];
