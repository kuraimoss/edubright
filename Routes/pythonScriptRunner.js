const { spawn } = require('child_process');
const path = require('path');

const runPrediction = (inputText, callback) => {
    const pythonPath = path.join(__dirname, '..', 'python', 'predict.py');
    const pythonProcess = spawn('python3', [pythonPath, inputText]);

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
            callback(`Python process failed with code ${code}`, null);
        } else {
            console.log("Output dari Python:", output);

            const result = output.split('\n').filter(line => line.trim() !== '').pop();
            const timestamp = new Date().toISOString();

            callback(null, {
                success: true,
                prediction: result.trim(),
                timestamp: timestamp,
                message: "Prediksi berhasil diproses!"
            });
        }
    });
};

const pythonRoutes = [
    {
        method: 'POST',
        path: '/predict',
        handler: async (request, h) => {
            try {
                const inputText = request.payload.text;
                // console.log("Input Text diterima:", inputText); // Debugging inputText

                const result = await new Promise((resolve, reject) => {
                    runPrediction(inputText, (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                });

                return h.response(result).code(200);
            } catch (error) {
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
        method: "GET",
        path: "/predict",
        handler: (request, h) => {
            return h.file('Documentation/denied.html').code(403);
        },
    }


];

module.exports = pythonRoutes;
