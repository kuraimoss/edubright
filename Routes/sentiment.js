require('dotenv').config();
const tf = require('@tensorflow/tfjs-node');
const tflite = require('@tensorflow/tfjs-tflite');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Joi = require('joi'); // Pastikan Joi diimpor untuk validasi

let model;
let tokenizer; // Pastikan Anda menyediakan tokenizer yang sesuai jika menggunakan BERT

// Fungsi untuk mengunduh model dari Google Cloud Storage
async function downloadModel() {
    const modelUrl = 'https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.tflite';
    const modelPath = path.join(__dirname, 'models', 'bert_sentiment_model.tflite');

    if (fs.existsSync(modelPath)) {
        console.log("Model already downloaded.");
        return;
    }

    console.log("Downloading model...");
    const response = await fetch(modelUrl);
    const buffer = await response.buffer();

    fs.mkdirSync(path.join(__dirname, 'models'), { recursive: true });
    fs.writeFileSync(modelPath, buffer);

    console.log("Model downloaded successfully!");
}

// Fungsi untuk memuat model TensorFlow Lite
async function loadModel() {
    try {
        await downloadModel();
        model = await tflite.loadTFLiteModel('file://./models/bert_sentiment_model.tflite');
        console.log("Model successfully loaded.");
    } catch (error) {
        console.error("Error loading the model:", error);
        throw error;
    }
}

// Fungsi untuk memproses input dan melakukan prediksi sentimen
async function prepareData(inputText) {
    const tokenized = tokenizer.encode(inputText, {
        maxLength: 256,
        truncation: true,
        padding: 'max_length',
        addSpecialTokens: true,
        returnTensors: 'tf'
    });

    return {
        input_ids: tf.cast(tokenized.input_ids, 'float64'),
        attention_mask: tf.cast(tokenized.attention_mask, 'float64')
    };
}

// Fungsi untuk melakukan prediksi sentimen
async function makePrediction(processedData) {
    if (!model) {
        throw new Error("Model not loaded. Please load the model first.");
    }

    const prediction = await model.predict([processedData.input_ids, processedData.attention_mask]);
    const classes = ['Awful', 'Poor', 'Neutral', 'Good', 'Awesome'];
    const sentimentIndex = prediction.argMax(-1).dataSync()[0];
    return classes[sentimentIndex];
}

// Modul untuk menangani rute API
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
            return h.file('Documentation/denied.html').code(403);
        },
    },
];
