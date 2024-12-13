require("dotenv").config(); // Memuat variabel environment dari file .env
const Joi = require("joi"); // Library untuk validasi input
const axios = require("axios"); // Library untuk melakukan HTTP request
const db = require("../database"); // Modul koneksi database

module.exports = [
  {
    // Route untuk mengirim komentar/feedback
    method: "POST",
    path: "/comment",
    options: {
      // Validasi input menggunakan Joi
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

        // Eksekusi query untuk menyimpan feedback
        const [result] = await db.query(query, [user_id, text, feedback_value]);

        // Respon sukses jika penyimpanan feedback berhasil
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
        // Penanganan error yang mungkin terjadi
        console.error("Error: ", err);
        let errorMessage = "Failed to save feedback.";
        
        // Penanganan error spesifik untuk API tidak dapat dijangkau
        if (err.response && err.response.status === 404) {
          errorMessage = "Prediction API not reachable.";
        }

        // Respon error jika penyimpanan feedback gagal
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
    // Route GET /comment ditolak
    method: "GET",
    path: "/comment",
    handler: (request, h) => {
      return h.file('Documentation/denied.html').code(403);
    },
  },
  {
    // Route untuk mengambil statistik feedback
    method: "GET",
    path: "/feedback-statistics",
    handler: async (request, h) => {
      try {
        // Query untuk mengambil total data dan jumlah tiap feedback_value
        const [rows] = await db.query(`
          SELECT feedback_value, COUNT(*) as count
          FROM feedbacks
          GROUP BY feedback_value
        `);

        // Total semua feedbacks
        const totalFeedbacks = rows.reduce((sum, row) => sum + row.count, 0);

        // Hitung persentase tiap feedback_value
        const statistics = ['Awful', 'Poor', 'Neutral', 'Good', 'Awesome'].map((feedback) => {
          // Cari data untuk setiap kategori feedback
          const feedbackRow = rows.find((row) => row.feedback_value === feedback);
          const count = feedbackRow ? feedbackRow.count : 0;
          
          // Hitung persentase, dengan penanganan pembagi nol
          const percentage = totalFeedbacks > 0 ? (count / totalFeedbacks) * 100 : 0;
          
          // Kembalikan objek statistik untuk setiap kategori
          return { feedback, count, percentage: percentage.toFixed(2) };
        });

        // Respon sukses dengan statistik feedback
        return h.response({
          status: "success",
          message: "Feedback statistics retrieved successfully.",
          totalFeedbacks,
          statistics,
        }).code(200);
      } catch (err) {
        // Penanganan error saat mengambil statistik
        console.error("Error fetching feedback statistics:", err);
        return h.response({
          status: "error",
          message: "Failed to retrieve feedback statistics.",
          details: err.message,
        }).code(500);
      }
    },
  },
];