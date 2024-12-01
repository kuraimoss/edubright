require('dotenv').config();
const tf = require('@tensorflow/tfjs-node');      // Menggunakan TensorFlow Node.js
const tflite = require('@tensorflow/tfjs-tflite'); // Menggunakan TensorFlow Lite
const fetch = require('node-fetch'); // Untuk mengunduh model
const fs = require('fs'); // Untuk menulis file ke sistem lokal
const path = require('path'); // Untuk menangani jalur file

let model;  // Variabel untuk model yang dimuat

// Fungsi untuk mengunduh model dari Google Cloud Storage
async function downloadModel() {
    const modelUrl = 'https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.tflite';
    const modelPath = path.join(__dirname, 'models', 'bert_sentiment_model.tflite');

    // Periksa jika model sudah ada, jika sudah, lewati unduhan
    if (fs.existsSync(modelPath)) {
        console.log("Model already downloaded.");
        return;
    }

    // Mengunduh model dan menyimpannya di sistem lokal
    console.log("Downloading model...");
    const response = await fetch(modelUrl);
    const buffer = await response.buffer();

    // Menyimpan file model di folder 'models'
    fs.mkdirSync(path.join(__dirname, 'models'), { recursive: true });
    fs.writeFileSync(modelPath, buffer);

    console.log("Model downloaded successfully!");
}

// Fungsi untuk memuat model TensorFlow Lite
async function loadModel() {
    try {
        // Mengunduh model jika belum ada
        await downloadModel();

        // Memuat model dari file .tflite yang sudah diunduh
        model = await tflite.loadTFLiteModel('file://./models/bert_sentiment_model.tflite');
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
