const { exec } = require('child_process');

function runPythonScript(inputText, callback) {
    // Tentukan perintah untuk menjalankan skrip Python dengan input teks
    const pythonCommand = `python3 python/predict.py "${inputText}"`;

    // Menjalankan skrip Python
    exec(pythonCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            const err = new Error('There was an issue executing the Python script.');
            err.details = error.message;  // Tambahkan detail error untuk referensi
            callback(err);  // Pastikan melemparkan objek Error
            return;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            const err = new Error('There was an error in the Python script.');
            err.details = stderr;  // Menambahkan detail error
            callback(err);  // Pastikan melemparkan objek Error
            return;
        }

        try {
            // Parse hasil output dari Python (yang sudah dalam format JSON)
            const result = JSON.parse(stdout);

            // Kirim kembali hasil prediksi dalam format yang diinginkan
            callback(null, {
                status: 'success',
                prediction: result.sentiment
            });
        } catch (err) {
            console.error('Error parsing JSON:', err);
            callback(new Error('Failed to parse the JSON response from Python.'));
        }
    });
}

server.route({
    method: 'POST',
    path: '/predict',
    handler: async (request, h) => {
        const inputText = request.payload.text;  // Ambil teks dari body request

        try {
            // Menjalankan skrip Python untuk mendapatkan prediksi
            const result = await new Promise((resolve, reject) => {
                runPythonScript(inputText, (error, result) => {
                    if (error) {
                        // Lemparkan error menggunakan objek Error
                        reject(new Error(error.message));
                    } else {
                        resolve(result);
                    }
                });
            });

            return h.response({
                status: 'success',
                prediction: result.prediction
            }).code(200);
        } catch (error) {
            console.error('Error during prediction:', error);

            // Jika terjadi error, pastikan error yang dilempar adalah objek Error
            return h.response({
                status: 'error',
                message: error.message  // Pastikan kita hanya melemparkan pesan error
            }).code(500);
        }
    }
});
