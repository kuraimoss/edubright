const { spawn } = require('child_process');
const path = require('path');

// Fungsi untuk menjalankan skrip Python dan mendapatkan prediksi
const runPrediction = (inputText, callback) => {
    // Tentukan path ke skrip Python
    const pythonPath = path.join(__dirname, '..', 'python', 'predict.py');
    
    // Jalankan skrip Python dengan menggunakan python3 (tergantung pada sistem Anda)
    const pythonProcess = spawn('python3', [pythonPath, inputText]);

    let output = '';
    let errorOutput = '';

    // Menangani data yang diterima dari stdout (output dari Python)
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Menangani error yang diterima dari stderr
    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    // Menangani proses selesai
    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}: ${errorOutput}`);
            return callback(errorOutput, null);
        }
        // Mengirimkan hasil prediksi ke callback
        callback(null, output);
    });
};

// Menambahkan rute POST untuk menangani prediksi
const pythonRoutes = [
    {
        method: 'POST',
        path: '/predict',
        handler: async (request, h) => {
            try {
                const inputText = request.payload.text; // Mengambil data text dari request body

                // Menjalankan skrip Python untuk mendapatkan prediksi
                await new Promise((resolve, reject) => {
                    runPrediction(inputText, (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                });

                return h.response({
                    success: true,
                    prediction: result // Hasil prediksi dari Python
                }).code(200);
            } catch (error) {
                console.error(error);
                return h.response({ success: false, message: error.message }).code(500);
            }
        }
    }
];

module.exports = pythonRoutes;
