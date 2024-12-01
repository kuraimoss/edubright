"use strict";

const tf = require('@tensorflow/tfjs-node'); // Pastikan ini digunakan untuk node.js
const tfTFLite = require('@tensorflow/tfjs-tflite'); // Mengimpor TFLite untuk tfjs-node
const path = require('path');
const modelManager = require('./modelManager'); // Mengimpor file modelManager.js
const Joi = require('joi'); // Untuk validasi request payload

let model = null;

/**
 * Fungsi untuk memuat model dari lokal setelah memeriksa dan mendownloadnya.
 */
async function loadModel() {
    try {
        // Memeriksa dan mendownload model jika belum ada di lokal
        await modelManager.checkAndDownloadModel();

        // Memuat model dari file lokal
        console.log("Loading model from local storage...");
        
        // Memuat model TFLite menggunakan tfjs-tflite
        model = await tfTFLite.node.loadTFLiteModel(path.join(__dirname, '..', 'models', 'bert_sentiment_model.tflite'));

        console.log("Model loaded successfully.");
    } catch (error) {
        console.error("Error loading the model:", error);
        throw error;
    }
}

/**
 * Fungsi untuk menjalankan prediksi sentiment menggunakan model
 */
async function predictSentiment(text) {
    if (!model) {
        throw new Error("Model is not loaded");
    }

    // Mengubah teks menjadi tensor, Anda mungkin perlu menyesuaikan ini dengan cara model Anda membutuhkan input
    // Sebagai contoh, ini hanya placeholder dan harus disesuaikan dengan input model TFLite Anda
    const inputTensor = tf.tensor([text]);  // Misalnya, sesuaikan dengan format input model Anda

    // Prediksi menggunakan model
    const predictions = model.predict(inputTensor);

    // Mengambil hasil prediksi
    // Sesuaikan dengan output model, misalnya mendapatkan nilai probabilitas atau kelas
    const output = predictions.arraySync();
    return output; // Anda bisa memodifikasi ini untuk mengembalikan nilai yang sesuai
}

/**
 * Route untuk analisis sentimen
 */
const routes = [
    {
        method: 'POST',
        path: '/analyze',
        handler: async (request, h) => {
            try {
                const { text } = request.payload;  // Mendapatkan teks dari payload
                if (!text) {
                    return h.response({ error: 'Text is required for sentiment analysis.' }).code(400);
                }

                // Memanggil fungsi predictSentiment dari sentiment.js untuk analisis
                const prediction = await predictSentiment(text);
                
                return h.response({
                    sentiment: prediction
                }).code(200);
            } catch (error) {
                console.error('Error during sentiment analysis:', error);
                return h.response({ error: 'Error during sentiment analysis.' }).code(500);
            }
        },
        options: {
            validate: {
                payload: Joi.object({
                    text: Joi.string().required().min(1).max(1000).messages({
                        'string.empty': 'Text cannot be empty.',
                        'any.required': 'Text is required.'
                    })
                })
            }
        }
    }
];

module.exports = {
    loadModel,
    predictSentiment,
    routes // Ekspor routes untuk digunakan di server.js
};
