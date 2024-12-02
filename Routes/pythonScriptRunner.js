const { spawn } = require('child_process');
const path = require('path');

// Fungsi untuk menjalankan skrip Python dan mendapatkan prediksi

const runPrediction = (inputText) => {
    return new Promise((resolve, reject) => {
        const pythonPath = path.join(__dirname, '..', 'python', 'predict.py');
        const pythonProcess = spawn('python3', [pythonPath, inputText]);

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
            console.log(`Python output: ${data.toString()}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error(`stderr: ${data.toString()}`);
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const parsedResult = JSON.parse(output);
                    resolve(parsedResult);  // Resolves with the parsed result
                } catch (error) {
                    reject('Error parsing Python output: ' + error.message);
                }
            } else {
                reject(`Python process exited with code ${code}: ${errorOutput}`);
            }
        });
    });
};

const pythonRoutes = [
    {
        method: 'POST',
        path: '/predict',
        handler: async (request, h) => {
            try {
                const inputText = request.payload.text;  // Mengambil text dari request body

                // Menjalankan skrip Python untuk mendapatkan prediksi
                const sentiment = await runPrediction(inputText);  // Mengambil hasil sentiment

                // Mengembalikan response dengan status yang benar
                return h.response({
                    status: 'success',  // Menambahkan status
                    success: true,
                    sentiment: sentiment  // Mengembalikan hasil sentiment saja
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
