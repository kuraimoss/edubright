const { spawn } = require('child_process');
const path = require('path');

// Fungsi untuk menjalankan skrip Python dan mendapatkan prediksi
const runPrediction = (inputText, callback) => {
    const pythonPath = path.join(__dirname, '..', 'python', 'predict.py');
    const pythonProcess = spawn('python3', [pythonPath, inputText]);

    let output = '';
    let errorOutput = '';

    // Menangani output dari Python (stdout)
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`Python output: ${data.toString()}`);  // Log untuk debugging
    });

    // Menangani error output dari Python (stderr)
    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`stderr: ${data.toString()}`);  // Log error output untuk debugging
    });

    // Menangani proses selesai (close)
    pythonProcess.on('close', (code) => {
        if (code === 0) {
            try {
                // Pastikan output bersih dari karakter tak terlihat
                output = output.trim();  // Hapus whitespace ekstra

                console.log("Full Python output:", output);  // Log untuk debugging

                // Pastikan output adalah JSON yang valid
                const isValidJSON = (str) => {
                    try {
                        JSON.parse(str);
                        return true;
                    } catch (e) {
                        return false;
                    }
                };

                if (isValidJSON(output)) {
                    const parsedResult = JSON.parse(output);
                    const sentiment = parsedResult.sentiment;
                    callback(null, sentiment);  // Kirim hasil prediksi
                } else {
                    callback('Invalid JSON output from Python', null);
                }
            } catch (error) {
                console.error('Error parsing Python output:', error);
                callback('Error parsing Python output: ' + error.message, null);
            }
        } else {
            // Jika proses Python gagal
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
                const sentiment = await new Promise((resolve, reject) => {
                    runPrediction(inputText, (error, result) => {
                        if (error) {
                            reject(error);  // Jika terjadi error, reject promise
                        } else {
                            resolve(result);  // Mengambil hasil prediksi
                        }
                    });
                });

                // Mengembalikan response dengan status yang benar
                return h.response({
                    status: 'success',
                    success: true,
                    prediction: sentiment  // Mengambil hasil prediksi
                }).code(200);  // Kode status 200 jika berhasil
            } catch (error) {
                console.error('Error during prediction:', error);
                return h.response({
                    status: 'error',
                    message: error.message  // Pesan error
                }).code(500);  // Kode status 500 jika terjadi error
            }
        }
    }
];

module.exports = pythonRoutes;
