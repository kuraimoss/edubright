require("dotenv").config();
const Joi = require("joi");
const db = require("../database");

module.exports = [
    {
        method: "GET",
        path: "/get-feedbacks",  // URL endpoint
        handler: async (request, h) => {
            try {
                // Query untuk menarik data dari tabel feedbacks
                const [rows] = await db.query("SELECT * FROM feedbacks");

                if (rows.length === 0) {
                    // Jika tidak ada data
                    return h
                        .response({
                            status: "error",
                            error: "No data found in the feedbacks table.",
                            details: "No feedback records found.",
                        })
                        .code(404);  // Kode 404 jika data tidak ditemukan
                }

                // Mengembalikan data feedbacks jika ditemukan
                return h
                    .response({
                        status: "success",
                        message: "Feedbacks fetched successfully.",
                        data: rows,
                    })
                    .code(200);  // Kode 200 untuk data yang ditemukan
            } catch (err) {
                console.error("Database Error: ", err);
                // Menangani kesalahan pada query atau database
                return h
                    .response({
                        status: "error",
                        error: "Failed to fetch feedbacks.",
                        details: err.message,
                    })
                    .code(500);  // Kode 500 jika ada error pada server
            }
        },
    },
    {
        method: "GET",
        path: "/get-users",  // URL endpoint
        handler: async (request, h) => {
            try {
                // Query untuk menarik data dari tabel users
                const [rows] = await db.query("SELECT * FROM users");

                if (rows.length === 0) {
                    // Jika tidak ada data
                    return h
                        .response({
                            status: "error",
                            error: "No data found in the users table.",
                            details: "No user records found.",
                        })
                        .code(404);  // Kode 404 jika data tidak ditemukan
                }

                // Mengembalikan data users jika ditemukan
                return h
                    .response({
                        status: "success",
                        message: "Users fetched successfully.",
                        data: rows,
                    })
                    .code(200);  // Kode 200 untuk data yang ditemukan
            } catch (err) {
                console.error("Database Error: ", err);
                // Menangani kesalahan pada query atau database
                return h
                    .response({
                        status: "error",
                        error: "Failed to fetch users.",
                        details: err.message,
                    })
                    .code(500);  // Kode 500 jika ada error pada server
            }
        },
    }
];
