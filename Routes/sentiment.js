"use strict";

const tflite = require('@tensorflow/tfjs-tflite'); // Gunakan library tfjs-tflite
global.self = global; // Tambahkan self agar kompatibel dengan Node.js

let model;

// Fungsi untuk memuat model
async function loadModel() {
    try {
        const modelPath = 'https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.tflite';
        model = await tflite.loadTFLiteModel(modelPath);
        console.log("Model loaded successfully!");
    } catch (error) {
        console.error("Error loading the model:", error);
        throw error;
    }
}

// Fungsi untuk memproses input teks menjadi tensor
function prepareData(inputText, tokenizer) {
    const token = tokenizer.encode(inputText, {
        truncation: true,
        padding: "max_length",
        maxLength: 128,
    });

    return {
        input_ids: new Float32Array(token.inputIds),
        attention_mask: new Float32Array(token.attentionMask),
    };
}

// Fungsi untuk memprediksi sentimen
async function predictSentiment(text, tokenizer) {
    if (!model) {
        throw new Error("Model not loaded. Please load the model first.");
    }

    // Preprocessing input data
    const { input_ids, attention_mask } = prepareData(text, tokenizer);

    // Predict using the model
    const predictions = model.predict([input_ids, attention_mask]);
    const sentiment = postProcess(predictions);

    return sentiment;
}

// Fungsi untuk post-processing prediksi
function postProcess(predictions, classes = ['Awful', 'Poor', 'Neutral', 'Good', 'Awesome']) {
    const probs = Array.from(predictions.dataSync());
    const sentimentIndex = probs.indexOf(Math.max(...probs));
    return classes[sentimentIndex];
}

// Route handler untuk API
async function sentimentHandler(request, h) {
    const { text } = request.payload;

    if (!text) {
        return h.response({ error: "Text is required" }).code(400);
    }

    try {
        const tokenizer = await tflite.loadTokenizer('bert-base-uncased'); // Pastikan tokenizer kompatibel
        const sentiment = await predictSentiment(text, tokenizer);

        return h.response({
            text,
            sentiment,
        }).code(200);
    } catch (error) {
        console.error("Error processing sentiment:", error);
        return h.response({ error: "Internal Server Error" }).code(500);
    }
}

module.exports = {
    loadModel,
    sentimentHandler,
};
