require("dotenv").config();
const Joi = require("joi");
const tflite = require('@tensorflow/tfjs-tflite');  // Menggunakan TensorFlow Lite
const tf = require('@tensorflow/tfjs-node');      // Menggunakan TensorFlow Node.js
const fetch = require('node-fetch');              // Untuk mengunduh file model
const fs = require('fs');                         // Untuk memeriksa keberadaan file lokal

let model;  // Variabel untuk model yang dimuat


// Fungsi untuk memuat model dari URL atau lokal
async function loadModel() {
    const modelPath = './models/bert_sentiment_model.tflite';  // Path lokal untuk model
    const modelUrl = 'https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.tflite';  // URL model
  
    // Cek apakah model sudah ada secara lokal
    if (fs.existsSync(modelPath)) {
      console.log("Model ditemukan secara lokal, memuat model...");
      model = await tflite.loadTFLiteModel(modelPath);  // Muat model dari file lokal
    } else {
      console.log("Model tidak ditemukan secara lokal, mengunduh model...");
      
      // Mengunduh model dari URL
      const response = await fetch(modelUrl);
      if (!response.ok) {
        throw new Error('Gagal mengunduh model');
      }
      const buffer = await response.buffer();
      fs.writeFileSync(modelPath, buffer);  // Simpan model yang diunduh secara lokal
      
      // Muat model setelah diunduh
      model = await tflite.loadTFLiteModel(modelPath);
    }
  
    console.log("Model berhasil dimuat.");
  }
  
  // Panggil fungsi loadModel agar model dapat dimuat
  loadModel()
    .then(() => {
      console.log("Model siap digunakan.");
    })
    .catch(err => {
      console.error("Gagal memuat model:", err);
    });
// Fungsi untuk memproses input dan melakukan prediksi sentimen
async function prepareData(inputText) {
    // Tokenizer harus disesuaikan untuk BERT atau model yang Anda gunakan
    const tokenized = tokenizer.encode(inputText, { 
        maxLength: 256, 
        truncation: true, 
        padding: 'max_length', 
        addSpecialTokens: true,
        returnTensors: 'tf'  // Pastikan ini mengembalikan tensor yang benar
    });

    // Mengembalikan input yang siap untuk dimasukkan ke model
    return {
        input_ids: tf.cast(tokenized.input_ids, 'float64'),
        attention_mask: tf.cast(tokenized.attention_mask, 'float64')
    };
}

async function makePrediction(processedData) {
    if (!model) {
        throw new Error("Model not loaded. Please load the model first.");
    }

    // Prediksi sentimen menggunakan model yang dimuat
    const prediction = await model.predict([processedData.input_ids, processedData.attention_mask]);

    // Menentukan kelas berdasarkan hasil prediksi
    const classes = ['Awful', 'Poor', 'Neutral', 'Good', 'Awesome'];
    const sentimentIndex = prediction.argMax(-1).dataSync()[0];  // Mendapatkan indeks kelas dengan probabilitas tertinggi
    return classes[sentimentIndex];
}

// Menambahkan route untuk sentiment analysis
module.exports = [
    {
        method: "POST",
        path: "/predict-sentiment",
        options: {
            validate: {
                payload: Joi.object({
                    text: Joi.string().min(1).required(), // Validasi input teks
                }),
            },
        },
        handler: async (request, h) => {
            const { text } = request.payload;

            if (!text) {
                return h.response({ error: "Text is required" }).code(400);
            }

            try {
                // Preprocess input
                const processedData = await prepareData(text);

                // Prediksi sentimen berdasarkan teks yang diterima
                const sentimentResult = await makePrediction(processedData);

                // Mengembalikan hasil analisis sentimen
                return h.response({
                    status: "success",
                    sentiment: sentimentResult,
                    text: text,
                }).code(200);
            } catch (error) {
                console.error("Error processing sentiment:", error);
                return h.response({ error: "Internal Server Error" }).code(500);
            }
        },
    },

    {
        method: "GET",
        path: "/predict-sentiment",
        handler: (request, h) => {
            // Jika ada request GET ke /predict-sentiment, kembalikan akses ditolak
            return h.file('Documentation/denied.html').code(403);
        },
    },
];
