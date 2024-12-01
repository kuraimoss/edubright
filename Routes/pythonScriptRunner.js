const { spawn } = require('child_process');
const path = require('path');

// Fungsi untuk menjalankan skrip Python dan mendapatkan prediksi
const runPrediction = (inputText, callback) => {
    const pythonPath = path.join(__dirname, '..', 'python', 'predict.py');
    const pythonProcess = spawn('python3', [pythonPath, inputText]);

    let output = '';

    pythonProcess.stdout.on('data', (data) => {
        output += data.toString(); // Mengumpulkan data output dari Python
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
            callback(new Error("Python script failed"));
        } else {
            try {
                // Mengurai output Python yang diharapkan berupa JSON
                const parsedOutput = JSON.parse(output);
                const sentiment = parsedOutput.sentiment; // Ambil nilai 'sentiment'
                callback(null, sentiment); // Mengirimkan hasil ke callback
            } catch (error) {
                console.error('Error parsing Python output:', error);
                callback(new Error("Error parsing Python output"));
            }
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
