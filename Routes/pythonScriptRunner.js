const { spawn } = require('child_process');
const path = require('path');

// Fungsi untuk menjalankan skrip Python dan mendapatkan prediksi

const runPrediction = (inputText, callback) => {
    const pythonPath = path.join(__dirname, '..','python', 'predict.py');
    const pythonProcess = spawn('python3', [pythonPath, inputText]);

    // Menangani data yang diterima dari stdout (output dari Python)
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Menangani error jika ada
    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    // Menangani proses selesai
    pythonProcess.on('close', (code) => {
        if (code === 0) {
            try {
                // Parsing hasil JSON yang diterima
                const parsedResult = JSON.parse(output);
                callback(null, parsedResult);  // Mengirimkan hasil JSON ke callback
            } catch (error) {
                callback('Error parsing Python output: ' + error.message, null);
            }
        } else {
            callback(`Python process exited with code ${code}`, null);
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
                const result = await new Promise((resolve, reject) => {
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
                    prediction: result.sentiment,
                }).code(200);
            } catch (error) {
                return h.response({
                    success: false,
                    message: error.message || 'An error occurred while processing the prediction',
                }).code(500);
            }
        }
    }
];
module.exports = pythonRoutes;
