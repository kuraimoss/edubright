const fs = require('fs');
const https = require('https');
const path = require('path');

// URL dari Google Cloud Storage
const modelUrl = 'https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.tflite';

// Path lokasi model di direktori lokal
const modelDirectory = path.join(__dirname, 'models');
const modelPath = path.join(modelDirectory, 'bert_sentiment_model.tflite');

// Fungsi untuk memastikan folder models ada
const ensureModelDirectoryExists = () => {
  if (!fs.existsSync(modelDirectory)) {
    fs.mkdirSync(modelDirectory, { recursive: true });
    console.log('Directory created:', modelDirectory);
  }
};

// Fungsi untuk mendownload model
const downloadModel = () => {
  console.log('Downloading model...');

  https.get(modelUrl, (response) => {
    if (response.statusCode === 200) {
      const file = fs.createWriteStream(modelPath);

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('Model downloaded successfully to', modelPath);
      });
    } else {
      console.error('Failed to download model. Status code:', response.statusCode);
    }
  }).on('error', (err) => {
    console.error('Error during download:', err);
  });
};

// Fungsi utama untuk mengecek dan mendownload model jika belum ada
const checkAndDownloadModel = () => {
  // Pastikan folder model ada
  ensureModelDirectoryExists();

  // Cek apakah model sudah ada di lokal
  if (fs.existsSync(modelPath)) {
    console.log('Model already exists. Skipping download.');
  } else {
    downloadModel();
  }
};

// Panggil fungsi utama
checkAndDownloadModel();
