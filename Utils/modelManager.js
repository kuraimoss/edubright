const fs = require('fs');
const https = require('https');
const path = require('path');

// URL model yang ingin diunduh
const modelUrl = 'https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.tflite';
const modelDirectory = path.join(__dirname, '..', 'models');
const modelPath = path.join(modelDirectory, 'bert_sentiment_model.tflite');

// Fungsi untuk mengunduh model
const downloadModel = () => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(modelDirectory)) {
            fs.mkdirSync(modelDirectory, { recursive: true });
        }

        const file = fs.createWriteStream(modelPath);
        https.get(modelUrl, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                console.log('Model berhasil diunduh');
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(modelPath, () => {}); // Hapus file jika terjadi error
            reject(err);
        });
    });
};

// Fungsi untuk memeriksa apakah model sudah ada
const checkAndDownloadModel = async () => {
    if (fs.existsSync(modelPath)) {
        console.log('Model sudah ada, melewati proses pengunduhan.');
        return;
    }

    console.log('Model belum ada, mengunduh model...');
    await downloadModel();
};

module.exports = { checkAndDownloadModel };
