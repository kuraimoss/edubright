"use strict";

require('dotenv').config();
const Hapi = require("@hapi/hapi");
const Path = require("path");
const sentiment = require('./Routes/sentiment'); // Pastikan ini merujuk ke file sentiment.js yang benar

// Fungsi untuk memulai server Hapi.js
const init = async () => {
    try {
        // Memuat model dan tokenizer sebelum memulai server
        await sentiment.loadModel();
        console.log("Model successfully loaded.");

        const server = Hapi.server({
            port: process.env.PORT || 80,  // Pastikan port 80 digunakan
            host: "0.0.0.0"
        });

        // Register inert plugin untuk serve static file
        await server.register(require('@hapi/inert'));

        // Rute utama, untuk mengakses dokumentasi atau beranda
        server.route({
            method: "GET",
            path: "/",
            handler: (request, h) => {
                return h.file(Path.join(__dirname, "Documentation", "index.html"));
            }
        });

        // Mendaftarkan rute untuk autentikasi dan sentiment analysis
        server.route([
            ...require("./Routes/auth"), // Rute untuk autentikasi
            ...require("./Routes/sentiment") // Rute untuk analisis sentimen
        ]);

        // Mulai server
        await server.start();
        console.log("HTTP Server running on %s", server.info.uri);
    } catch (error) {
        console.error("Error starting the server:", error);
        process.exit(1);
    }
};

// Menangani unhandled rejection (kesalahan yang tidak tertangani)
process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
});

// Memulai server
init();
