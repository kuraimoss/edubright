const { spawn } = require('child_process');
const path = require('path');

// Fungsi untuk menjalankan skrip Python dan mendapatkan prediksi

const runPrediction = (inputText) => {
    return new Promise((resolve, reject) => {
        const pythonPath = path.join(__dirname, '..', 'python', 'predict.py');
        const pythonProcess = spawn('python3', [pythonPath, inputText]);

        let output = '';
        let errorOutput = '';

        // Menangkap data output dari python
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
            console.log(`Python output: ${data.toString()}`);
        });

        // Menangkap error output dari python
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error(`stderr: ${data.toString()}`);
        });

        // Proses setelah Python selesai
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    // Membersihkan output untuk memastikan itu JSON valid
                    output = output.trim(); // Menghapus spasi atau karakter tak diinginkan

                    // Pastikan output adalah JSON sebelum parsing
                    if (output && output[0] === '{' && output[output.length - 1] === '}') {
                        const parsedResult = JSON.parse(output);
                        resolve(parsedResult);  // Resolves with the parsed result
                    } else {
                        reject('Invalid JSON output from Python');
                    }
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
                    status: 'success',  // Status success
                    success: true,
                    sentiment: result.sentiment  // Mengembalikan hasil sentiment saja
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
