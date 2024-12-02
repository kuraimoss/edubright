const { spawn } = require('child_process');
const path = require('path');

// Fungsi untuk menjalankan skrip Python dan mendapatkan prediksi
const runPrediction = (inputText) => {
    return new Promise((resolve, reject) => {
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
                    const parsedResult = JSON.parse(output);
                    const sentiment = parsedResult.sentiment;  // Mengambil nilai 'sentiment'

                    resolve(sentiment);  // Resolve dengan hasil prediksi (sentiment)
                } catch (error) {
                    console.error('Error parsing Python output:', error);
                    reject('Error parsing Python output: ' + error.message);
                }
            } else {
                // Jika proses Python gagal
                reject(`Python process exited with code ${code}: ${errorOutput}`);
            }
        });
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

                if (!inputText || typeof inputText !== 'string') {
                    return h.response({
                        status: 'error',
                        message: 'Text input is required and should be a string.'
                    }).code(400);  // Kode status 400 untuk input yang salah
                }

                // Menjalankan skrip Python untuk mendapatkan prediksi
                const sentiment = await runPrediction(inputText);

                // Mengembalikan response dengan status yang benar
                return h.response({
                    status: 'success',
                    success: true,
                    sentiment: sentiment  // Mengambil hasil prediksi (sentiment)
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
