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

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            return callback(new Error(`Python script exited with code ${code}`));
        }

        try {
            // Mengubah output menjadi JSON
            const parsedOutput = JSON.parse(output);
            callback(null, parsedOutput);
        } catch (err) {
            callback(new Error(`Error parsing Python output: ${err.message}`));
        }
    });
};

const pythonRoutes = [
    {
        method: 'POST',
        path: '/predict',
        handler: async (request, h) => {
            try {
                const inputText = request.payload.text; // Mengambil data text dari request body

                let result;
                // Menjalankan skrip Python untuk mendapatkan prediksi
                await new Promise((resolve, reject) => {
                    runPrediction(inputText, (error, res) => {
                        if (error) {
                            reject(error);
                        } else {
                            result = res;  // Ambil hasil dari Python
                            resolve();
                        }
                    });
                });

                // Mengembalikan response dengan hasil prediksi
                return h.response({
                    status: 'success',
                    prediction: result.sentiment  // Mengembalikan prediksi sentiment
                }).code(200);

            } catch (error) {
                console.error('Error during prediction:', error);
                return h.response({ success: false, error: error.message }).code(500);
            }
        }
    }
];


module.exports = pythonRoutes;
