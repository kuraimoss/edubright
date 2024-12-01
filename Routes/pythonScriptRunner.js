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
                let result;
                await new Promise((resolve, reject) => {
                    runPrediction(inputText, (error, resultData) => {
                        if (error) {
                            reject(error);
                        } else {
                            result = resultData;
                            resolve(result);
                        }
                    });
                });

                // Menyiapkan response sesuai dengan format yang diharapkan oleh test case
                return h.response({
                    status: 'success',
                    data: {
                        prediction: result // Hasil prediksi dari Python
                    }
                }).code(200); // Pastikan status code 200
            } catch (error) {
                return h.response({
                    status: 'error',
                    message: error.message
                }).code(500);
            }
        }
    }
];


module.exports = pythonRoutes;
