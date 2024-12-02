const { exec } = require('child_process');

function runPythonScript(inputText, callback) {
    // Tentukan perintah untuk menjalankan skrip Python dengan input teks
    const pythonCommand = `python3 python/predict.py "${inputText}"`;

    // Menjalankan skrip Python
    exec(pythonCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            callback({
                status: 'error',
                message: 'There was an issue executing the Python script.'
            });
            return;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            callback({
                status: 'error',
                message: 'There was an error in the Python script.'
            });
            return;
        }

        try {
            // Parse hasil output dari Python (yang sudah dalam format JSON)
            const result = JSON.parse(stdout);

            // Kirim kembali hasil prediksi dalam format yang diinginkan
            callback({
                status: 'success',
                prediction: result.sentiment
            });
        } catch (err) {
            console.error('Error parsing JSON:', err);
            callback({
                status: 'error',
                message: 'Failed to parse the JSON response from Python.'
            });
        }
    });
}

    // Rute POST untuk prediksi
    server.route({
        method: 'POST',
        path: '/predict',
        handler: (request, h) => {
            const inputText = request.payload.text;  // Ambil teks dari body request

            return new Promise((resolve, reject) => {
                runPythonScript(inputText, (result) => {
                    // Jika hasil sukses
                    if (result.status === 'success') {
                        resolve({
                            status: result.status,
                            prediction: result.prediction
                        });
                    } else {
                        reject({
                            status: result.status,
                            message: result.message
                        });
                    }
                });
            });
        }
    });


module.exports = runPythonScript;
