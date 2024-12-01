const { spawn } = require('child_process');
const path = require('path');

// Fungsi untuk menjalankan skrip Python dan mendapatkan prediksi
const runPrediction = (inputText, callback) => {
    const pythonPath = path.join(__dirname, '..', 'python', 'predict.py');
    const python = spawn('python3', [pythonPath, inputText]);

    let output = '';
    let error = '';

    python.stdout.on('data', (data) => {
        output += data.toString();
    });

    python.stderr.on('data', (data) => {
        error += data.toString();
    });

    python.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            console.error(error);
            callback(error, null);
            return;
        }

        try {
            // Menguraikan output JSON
            const result = JSON.parse(output);
            callback(null, result);
        } catch (e) {
            console.error('Error parsing Python output:', e);
            callback(e, null);
        }
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
