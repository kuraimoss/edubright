require("dotenv").config();
const Joi = require("joi");
const tflite = require('@tensorflow/tfjs-tflite');  // Import TensorFlow Lite library
const fetch = require('node-fetch');  // Import fetch untuk mengunduh file dari URL

let model;

// Fungsi untuk memuat model dari URL
async function loadModel() {
    try {
        const modelUrl = 'https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.tflite';
        
        // Mengunduh model menggunakan fetch
        const res = await fetch(modelUrl);
        const buffer = await res.buffer(); // Mengambil buffer dari response

        // Memuat model dari buffer
        model = await tflite.loadTFLiteModel(buffer);
        console.log("Model successfully loaded.");
    } catch (error) {
        console.error("Error loading the model:", error);
        throw error;
    }
}

// Fungsi untuk memproses input dan prediksi sentimen
async function predictSentiment(text) {
    if (!model) {
        throw new Error("Model not loaded. Please load the model first.");
    }

    // Proses input dan prediksi sentimen
    const sentiment = await model.predict(text); // Ganti dengan prediksi sesuai dengan model yang Anda miliki
    return sentiment;
}

// Menambahkan route untuk sentiment analysis
module.exports = [
  {
    method: "POST",
    path: "/predict-sentiment",
    options: {
      validate: {
        payload: Joi.object({
          text: Joi.string().min(1).required(), // Validasi input text
        }),
      },
    },
    handler: async (request, h) => {
      const { text } = request.payload;

      if (!text) {
        return h.response({ error: "Text is required" }).code(400);
      }

      try {
        // Prediksi sentimen berdasarkan teks yang diterima
        const sentimentResult = await predictSentiment(text);

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
      return h.file('Documentation/denied.html').code(403);
    },
  },
];
