const fs = require("fs"); // Modul untuk operasi file system
const https = require("https"); // Modul untuk melakukan download via HTTPS
const path = require("path"); // Modul untuk memanipulasi path file

// URL tempat model BERT disimpan di cloud storage
const modelUrl =
  "https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.h5";

// Direktori untuk menyimpan model
const modelDirectory = path.join(__dirname, "..", "models");

// Path lengkap file model
const modelPath = path.join(modelDirectory, "bert_sentiment_model.h5");

// Fungsi untuk mendownload model dari URL
const downloadModel = () => {
  return new Promise((resolve, reject) => {
    // Buat direktori models jika belum ada
    if (!fs.existsSync(modelDirectory)) {
      fs.mkdirSync(modelDirectory, {
        recursive: true, // Membuat direktori secara rekursif jika belum ada
      });
    }

    // Buat write stream untuk menyimpan file model
    const file = fs.createWriteStream(modelPath);
    
    // Mulai proses download
    https
      .get(modelUrl, (response) => {
        // Pipe data dari response ke file
        response.pipe(file);
        
        // Event listener ketika download selesai
        file.on("finish", () => {
          console.log("Model berhasil diunduh");
          resolve(); // Resolve promise jika download sukses
        });
      })
      .on("error", (err) => {
        // Hapus file jika terjadi error
        fs.unlink(modelPath, () => {});
        reject(err); // Reject promise jika terjadi error
      });
  });
};

// Fungsi untuk memeriksa dan mendownload model jika belum ada
const checkAndDownloadModel = async () => {
  // Periksa apakah model sudah ada
  if (fs.existsSync(modelPath)) {
    console.log("Model sudah ada, melewati proses pengunduhan.");
    return;
  }

  // Jika model belum ada, mulai proses download
  console.log("Model belum ada, mengunduh model...");
  await downloadModel();
};

// Ekspor fungsi untuk digunakan di tempat lain
module.exports = {
  checkAndDownloadModel,
};