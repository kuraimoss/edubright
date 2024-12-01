require("dotenv").config();
const Joi = require("joi");
const tflite = require('@tensorflow/tfjs-tflite');  // Menggunakan TensorFlow Lite
const tf = require('@tensorflow/tfjs-node');      // Menggunakan TensorFlow Node.js
const fetch = require('node-fetch');              // Untuk mengunduh file model
global.self = global;
let model;  // Variabel untuk model yang dimuat
let tokenizer;  // Tokenizer perlu disesuaikan sesuai model Anda (misalnya, BERT Tokenizer)

// Fungsi untuk memuat model dan tokenizer dari URL
async function loadModel() {
    try {
        const modelUrl = 'https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.tflite';

        // Mengunduh model menggunakan fetch
        const res = await fetch(modelUrl);
        const buffer = await res.buffer();  // Mengambil buffer dari response

        // Memuat model menggunakan TensorFlow Lite
        model = await tflite.loadTFLiteModel(buffer);
        console.log("Model successfully loaded.");
    } catch (error) {
        console.error("Error loading the model:", error);
        throw error;  // Jika gagal, lempar error
    }
}

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

// Fungsi untuk membuat prediksi menggunakan model yang dimuat
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

// Mengekspor fungsi-fungsi ini
module.exports = {
    loadModel,  // Mengekspor loadModel untuk digunakan di server.js
    predictSentiment: [
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
    ]
};
