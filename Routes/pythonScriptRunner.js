const { spawn } = require('child_process');
const path = require('path');

// Fungsi untuk menjalankan skrip Python dan mendapatkan prediksi
const runPrediction = (inputText, callback) => {
    const pythonPath = path.join(__dirname, '..','python', 'predict.py');
    const pythonProcess = spawn('python3', [pythonPath, inputText]);

    let result = '';
    
    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            // Pastikan output Python adalah JSON yang valid
            try {
                const parsedResult = JSON.parse(result); // Parse JSON dari output
                console.log('Predicted Sentiment:', parsedResult.sentiment);
                callback(null, parsedResult.sentiment); // Kirim hasil ke callback
            } catch (error) {
                console.error('Error parsing Python output:', error);
                callback(error, null);
            }
        } else {
            console.error(`Python script exited with code ${code}`);
            callback(new Error(`Python script failed with exit code ${code}`), null);
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
                    prediction: parsedResult.sentiment // Hasil prediksi dari Python
                }).code(200);
            } catch (error) {
                console.error(error);
                return h.response({ success: false, message: error.message }).code(500);
            }
        }
    }
];

module.exports = pythonRoutes;
