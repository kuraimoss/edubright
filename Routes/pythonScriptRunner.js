const { spawn } = require('child_process');
const path = require('path');

// Fungsi untuk menjalankan skrip Python dan mendapatkan prediksi

const runPrediction = (inputText, callback) => {
    const pythonPath = path.join(__dirname, '..', 'python', 'predict.py');
    const pythonProcess = spawn('python3', [pythonPath, inputText]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`Python output: ${data.toString()}`);  // Log output untuk debug
    });

    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`stderr: ${data.toString()}`);  // Log error output untuk debug
    });

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
            callback(`Python process exited with code ${code}: ${errorOutput}`, null);
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
                const inputText = request.payload.text;  // Mengambil text dari request body

                // Menjalankan skrip Python untuk mendapatkan prediksi
                const result = await new Promise((resolve, reject) => {
                    runPrediction(inputText, (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);  // Menyimpan hasil prediksi
                        }
                    });
                });

                // Mengembalikan response dengan status yang benar
                return h.response({
                    status: 'success',  // Menambahkan status
                    success: true,
                    prediction: result  // Hasil prediksi
                }).code(200);  // Kode status 200
            } catch (error) {
                console.error('Error during prediction:', error);
                return h.response({
                    status: 'error',
                    message: error.message
                }).code(500);  // Kode status 500 jika terjadi error
            }
        }
    }
];

module.exports = pythonRoutes;
