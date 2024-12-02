const { spawn } = require('child_process');
const path = require('path');

// Fungsi untuk menjalankan skrip Python dan mendapatkan prediksi
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
                // Parsing hasil output Python yang berupa JSON
                const parsedResult = JSON.parse(output); // Parsing string menjadi objek JSON
                
                // Mengambil hasil prediksi (sentiment) dari JSON
                const sentiment = parsedResult.sentiment;  // Ambil nilai dari field "sentiment"
                callback(null, sentiment);  // Kirimkan hasil prediksi ke callback
            } catch (error) {
                console.error('Error parsing Python output:', error);
                callback('Error parsing Python output: ' + error.message, null); // Kirim error jika terjadi masalah parsing
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
                            // Mengambil hasil prediksi dari JSON dan mengakses "sentiment"
                            try {
                                const parsedResult = JSON.parse(result);  // Parsing hasil JSON
                                resolve(parsedResult.sentiment);  // Mengambil "sentiment" dari JSON
                            } catch (parseError) {
                                reject('Error parsing Python output: ' + parseError.message);
                            }
                        }
                    });
                });

                // Mengembalikan response dengan status yang benar
                return h.response({
                    status: 'success',  // Menambahkan status
                    success: true,
                    prediction: sentiment  // Mengambil hasil prediksi dari "sentiment"
                }).code(200);  // Kode status 200 jika berhasil
            } catch (error) {
                // Jika terjadi error dalam proses prediksi
                console.error('Error during prediction:', error);
                return h.response({
                    status: 'error',  // Status error
                    message: error.message  // Pesan error
                }).code(500);  // Kode status 500 jika terjadi error
            }
        }
    }
];

module.exports = pythonRoutes;
