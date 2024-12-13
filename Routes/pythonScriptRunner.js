const { spawn } = require('child_process'); // Modul untuk menjalankan proses child (Python)
const path = require('path'); // Modul untuk memanipulasi path file

// Fungsi untuk menjalankan prediksi menggunakan script Python
const runPrediction = (inputText, callback) => {
    // Konstruksi path menuju script Python
    const pythonPath = path.join(__dirname, '..', 'python', 'predict.py');
    
    // Spawn proses Python dengan argumen input text
    const pythonProcess = spawn('python3', [pythonPath, inputText]);

    // Variabel untuk menampung output
    let output = '';
    
    // Event listener untuk menangkap output stdout
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Event listener untuk menangkap error
    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data.toString()}`);
    });

    // Event listener ketika proses Python selesai
    pythonProcess.on('close', (code) => {
        // Penanganan jika proses gagal
        if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
            callback(`Python process failed with code ${code}`, null);
        } else {
            // Log output dari Python
            console.log("Output dari Python:", output);

            // Ambil baris terakhir dari output (hasil prediksi)
            const result = output.split('\n').filter(line => line.trim() !== '').pop();
            
            // Buat timestamp
            const timestamp = new Date().toISOString();

            // Callback dengan hasil prediksi
            callback(null, {
                success: true,
                prediction: result.trim(),
                timestamp: timestamp,
                message: "Prediksi berhasil diproses!"
            });
        }
    });
};

// Definisi routes untuk prediksi
const pythonRoutes = [
    {
        // Route untuk melakukan prediksi
        method: 'POST',
        path: '/predict',
        handler: async (request, h) => {
            try {
                // Ambil input text dari payload
                const inputText = request.payload.text;
                // console.log("Input Text diterima:", inputText); // Debugging inputText

                // Jalankan prediksi menggunakan Promise
                const result = await new Promise((resolve, reject) => {
                    runPrediction(inputText, (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                });

                // Kembalikan response dengan hasil prediksi
                return h.response(result).code(200);
            } catch (error) {
                // Penanganan error
                console.error("Error pada handler prediksi:", error);
                return h.response({
                    success: false,
                    message: error.message || 'An error occurred while processing the prediction',
                    timestamp: new Date().toISOString()
                }).code(500);
            }
        }
    },
    {
        // Route GET /predict ditolak
        method: "GET",
        path: "/predict",
        handler: (request, h) => {
            return h.file('Documentation/denied.html').code(403);
        },
    }
];

// Ekspor routes
module.exports = pythonRoutes;