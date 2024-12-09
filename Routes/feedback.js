require("dotenv").config();
const Joi = require("joi");
const axios = require("axios");
const db = require("../database");

module.exports = [
  {
    method: "POST",
    path: "/comment",
    options: {
      validate: {
        payload: Joi.object({
          user_id: Joi.string().required(),  // user_id yang harus ada
          text: Joi.string().min(1).required(),  // Text komentar yang akan dikirim ke API
        }),
      },
    },
    handler: async (request, h) => {
      const { user_id, text } = request.payload;

      try {
        // Mengambil nilai feedback_value dari API eksternal dengan mengirim "text"
        const predictionResponse = await axios.post('http://34.128.104.99/predict', {
          text: text
        });

        const feedback_value = predictionResponse.data.prediction;  // Ambil "prediction" dari API

        // Menyimpan data feedback ke database
        const query = `
          INSERT INTO feedbacks (user_id, comment_text, feedback_value)
          VALUES (?, ?, ?)
        `;

        const [result] = await db.query(query, [user_id, text, feedback_value]);

        return h
          .response({
            status: "success",
            message: "Feedback successfully saved!",
            feedbackResult: {
              id: result.insertId,
              user_id,
              comment_text: text,
              feedback_value,
            },
          })
          .code(201);
      } catch (err) {
        console.error("Error: ", err);
        let errorMessage = "Failed to save feedback.";
        if (err.response && err.response.status === 404) {
          errorMessage = "Prediction API not reachable.";
        }

        return h
          .response({
            status: "error",
            error: errorMessage,
            details: err.message,
          })
          .code(500);
      }
    },
  },
  {
    method: "GET",
    path: "/comment",
    handler: (request, h) => {
      return h.file('Documentation/denied.html').code(403);
    },
  },
];
