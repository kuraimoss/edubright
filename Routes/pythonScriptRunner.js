const { exec } = require('child_process');

function runPythonScript(inputText, callback) {
    // Tentukan perintah untuk menjalankan skrip Python dengan input teks
    const pythonCommand = `python3 python/predict.py "${inputText}"`;

    // Menjalankan skrip Python
    exec(pythonCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            const err = new Error('There was an issue executing the Python script.');
            err.details = error;  // Menambahkan detail untuk error
            callback(err);
            return;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            const err = new Error('There was an error in the Python script.');
            err.details = stderr;  // Menambahkan detail untuk error
            callback(err);
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

module.exports = [
  {
    method: "POST",
    path: "/predict",  // Definisikan route POST untuk /predict
    handler: (request, h) => {
        const inputText = request.payload.text;  // Ambil teks dari body request

        return new Promise((resolve, reject) => {
            runPythonScript(inputText, (error, result) => {
                if (error) {
                    reject({
                        status: 'error',
                        message: error.message,
                        details: error.details || null
                    });
                } else {
                    resolve({
                        status: result.status,
                        prediction: result.prediction
                    });
                }
            });
        });
    }
  }
];
