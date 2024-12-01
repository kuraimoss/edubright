const Hapi = require("@hapi/hapi");
const { PythonShell } = require("python-shell"); // Menggunakan python-shell untuk menjalankan skrip Python
const path = require("path");

// Rute untuk prediksi
const predictRoute = {
    method: 'POST',
    path: '/predict',  // Endpoint untuk melakukan prediksi
    handler: async (request, h) => {
        const { inputText } = request.payload;  // Mendapatkan input dari body request

        return new Promise((resolve, reject) => {
            // Menjalankan skrip Python untuk prediksi
            PythonShell.run(path.join(__dirname, '../python/model_prediction.py'), {
                args: [inputText]  // Mengirimkan inputText ke skrip Python
            }, (err, result) => {
                if (err) {
                    return reject(h.response({ error: 'Error running Python script' }).code(500));
                }

                // Mengembalikan hasil prediksi dari Python
                const prediction = JSON.parse(result[0]);  // Result dari Python diubah menjadi JSON
                resolve(h.response(prediction).code(200));  // Mengembalikan hasil prediksi sebagai response
            });
        });
    }
};

module.exports = [predictRoute];
