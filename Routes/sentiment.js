"use strict";

const tf = require('@tensorflow/tfjs-node'); // Untuk bekerja dengan TensorFlow Lite
const fetch = require('node-fetch');
const Joi = require('joi');
const path = require('path');
const fs = require('fs');

let model = null;

async function loadModel() {
    try {
        console.log("Downloading model from Google Cloud Storage...");

        // URL untuk model TFLite
        const modelPath = 'https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.tflite';
        const response = await fetch(modelPath);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch model: ${response.statusText}`);
        }

        // Menyimpan model ke file lokal
        const buffer = await response.buffer();
        const localModelPath = path.join(__dirname, '..', 'models', 'bert_sentiment_model.tflite');
        fs.writeFileSync(localModelPath, buffer);
        console.log("Model successfully downloaded and saved locally.");

        // Memuat model TensorFlow Lite
        model = await tf.loadGraphModel(`file://${localModelPath}`);
        console.log("Model loaded successfully.");
    } catch (error) {
        console.error("Error loading the model:", error);
        throw error;
    }
}

async function predictSentiment(text) {
    if (!model) {
        throw new Error("Model is not loaded");
    }

    // Preprocessing text
    const tensor = tf.tensor([text]);

    // Melakukan prediksi dengan model
    const output = model.predict(tensor);
    const prediction = output.dataSync();  // Mengambil hasil prediksi

    return prediction;
}

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
