"use strict";

const tf = require("@tensorflow/tfjs-node"); // Menggunakan tfjs-node untuk bekerja dengan model TFLite
const fetch = require("node-fetch");
const Joi = require("joi"); // Import Joi untuk validasi
const path = require("path");
const fs = require('fs');

// Variabel untuk menyimpan model setelah dimuat
let model = null;

// Fungsi untuk memuat model
async function loadModel() {
    try {
        console.log("Downloading model from Google Cloud Storage...");

        const modelPath = 'https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.tflite'; // URL model TFLite
        const response = await fetch(modelPath);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch model: ${response.statusText}`);
        }

        // Simpan model TFLite ke dalam direktori lokal
        const buffer = await response.buffer();
        const localModelPath = path.join(__dirname, '..', 'models', 'bert_sentiment_model.tflite');
        fs.writeFileSync(localModelPath, buffer);
        console.log("Model successfully downloaded and saved locally.");

        // Memuat model dari file lokal
        model = await tf.node.loadTFLiteModel(localModelPath);
        console.log("Model loaded successfully.");
    } catch (error) {
        console.error("Error loading the model:", error);
        throw error;
    }
}

// Fungsi untuk membuat prediksi sentimen
async function predictSentiment(text) {
    if (!model) {
        throw new Error("Model is not loaded");
    }

    // Preprocessing teks jika diperlukan (misalnya, tokenisasi)
    const tensor = tf.tensor([text]);

    // Prediksi menggunakan model
    const output = model.predict(tensor);
    const prediction = output.dataSync();  // Ambil hasil prediksi

    return prediction;
}

// Ekspor routes dan fungsi loadModel
module.exports = {
    loadModel,
    predictSentiment,
    routes: [
        {
            method: "POST",
            path: "/predict-sentiment",
            handler: async (request, h) => {
                const { text } = request.payload;

                try {
                    const sentimentPrediction = await predictSentiment(text);
                    return h.response({ sentiment: sentimentPrediction }).code(200);
                } catch (error) {
                    console.error("Error during prediction:", error);
                    return h.response({ error: "Failed to predict sentiment" }).code(500);
                }
            },
            options: {
                validate: {
                    payload: Joi.object({
                        text: Joi.string().required(),
                    }),
                },
            },
        },
    ],
};
