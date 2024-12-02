const { spawn } = require('child_process');
const path = require('path');

// Fungsi untuk menjalankan skrip Python dan mendapatkan prediksi
const runPrediction = (inputText, callback) => {
    const pythonPath = path.join(__dirname, '..', 'python', 'predict.py');
    const pythonProcess = spawn('python3', [pythonPath, inputText]);

    // Menangani data yang diterima dari stdout (output dari Python)
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Menangani error jika ada
    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data.toString()}`);
    });

    // Menangani proses selesai
    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
            callback(`Python process failed with code ${code}`, null);
        } else {
            console.log("Output dari Python:", output); // Debugging output
            
            // Proses untuk hanya mengambil hasil prediksi (mengabaikan progress bar atau status lainnya)
            const result = output.split('\n').filter(line => line.trim() !== '').pop(); // Ambil baris terakhir
            callback(null, result.trim());  // Mengirimkan hasil prediksi sebagai string
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
                console.log("Input Text diterima:", inputText); // Debugging inputText

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
                    prediction: result,  // Menggunakan result langsung yang merupakan string
                }).code(200);
            } catch (error) {
                console.error("Error pada handler prediksi:", error);
                return h.response({
                    success: false,
                    message: error.message || 'An error occurred while processing the prediction',
                }).code(500);
            }
        }
    }
];

module.exports = pythonRoutes;
