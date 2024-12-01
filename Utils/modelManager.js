const fs = require('fs');
const https = require('https');
const path = require('path');

// URL model yang ingin diunduh
const modelUrl = 'https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.tflite';
const modelDirectory = path.join(__dirname, '..', 'models', 'python');
const modelPath = path.join(modelDirectory, 'bert_sentiment_model.tflite');

// Memastikan direktori untuk model sudah ada
if (!fs.existsSync(modelDirectory)) {
    fs.mkdirSync(modelDirectory, { recursive: true });
}

// Fungsi untuk mengunduh model
const downloadModel = () => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(modelPath);
        https.get(modelUrl, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log('Model berhasil diunduh.');
                    resolve();
                });
            } else {
                reject(new Error('Gagal mengunduh model.'));
            }
        }).on('error', (err) => {
            fs.unlink(modelPath, () => {});  // Menghapus file yang rusak jika gagal
            reject(err);
        });
    });
};

// Fungsi utama untuk memastikan model ada
const ensureModelExists = async () => {
    try {
        // Jika model belum ada, unduh modelnya
        if (!fs.existsSync(modelPath)) {
            console.log('Model belum diunduh, mulai proses pengunduhan...');
            await downloadModel();
        } else {
            console.log('Model sudah ada, melanjutkan...');
        }
    } catch (err) {
        console.error('Terjadi kesalahan:', err);
    }
};

// Menjalankan pengecekan dan pengunduhan model
ensureModelExists();
