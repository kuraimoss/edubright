const { exec } = require('child_process');

const { exec } = require('child_process');

function runPythonScript(inputText, callback) {
    const pythonCommand = `python3 python/predict.py "${inputText}"`;

    exec(pythonCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            console.error(`stderr: ${stderr}`);  // Tambahkan log untuk stderr
            callback(new Error('There was an issue executing the Python script.'));
            return;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);  // Menangani error yang ada di stderr
            callback(new Error('There was an error in the Python script.'));
            return;
        }

        try {
            const result = JSON.parse(stdout);
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

module.exports = [{
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
}]
