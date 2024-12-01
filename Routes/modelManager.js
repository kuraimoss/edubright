"use strict";

const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const MODEL_URL = 'https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.tflite';
const LOCAL_MODEL_PATH = path.join(__dirname, '..', 'models', 'bert_sentiment_model.tflite');

/**
 * Fungsi untuk memeriksa apakah model sudah ada di lokal.
 * Jika belum ada, akan mendownload model dari Cloud Storage.
 */
async function checkAndDownloadModel() {
    try {
        // Cek apakah model sudah ada di lokal
        if (fs.existsSync(LOCAL_MODEL_PATH)) {
            console.log('Model already exists locally. Skipping download.');
            return; // Jika sudah ada, tidak perlu mendownload lagi
        }

        console.log('Model not found locally. Downloading...');

        // Jika model belum ada, unduh dari Cloud Storage
        const response = await fetch(MODEL_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch model: ${response.statusText}`);
        }

        // Menyimpan model yang diunduh ke dalam file lokal
        const buffer = await response.buffer();
        fs.writeFileSync(LOCAL_MODEL_PATH, buffer);
        console.log('Model successfully downloaded and saved locally.');

    } catch (error) {
        console.error('Error during model download or check:', error);
        throw error;
    }
}

module.exports = {
    checkAndDownloadModel
};
