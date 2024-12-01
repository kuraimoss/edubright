"use strict";

require('dotenv').config();
const Hapi = require("@hapi/hapi");
const Path = require("path");
const sentiment = require('./Routes/sentiment'); // Pastikan kita mengimpor dengan benar

// Fungsi untuk menginisialisasi server
const init = async () => {
    try {
        // Memuat model dan tokenizer sebelum memulai server
        await sentiment.loadModel();  // Pastikan loadModel ada di sini
        console.log("Model successfully loaded.");

        // Membuat server Hapi
        const server = Hapi.server({
            port: process.env.PORT || 80,  // Gunakan port 80 atau port yang diset di .env
            host: "0.0.0.0"
        });

        // Register plugin inert untuk serve static file (HTML, CSS, JS)
        await server.register(require('@hapi/inert'));

        // Rute untuk halaman utama
        server.route({
            method: "GET",
            path: "/",
            handler: (request, h) => {
                return h.file(Path.join(__dirname, "Documentation", "index.html")); // Menyajikan file index.html dari folder Documentation
            }
        });

        // Register routes untuk analisis sentimen
        server.route(sentiment.routes);  // Pastikan menggunakan routes yang diekspor dari sentiment.js

        // Menjalankan server
        await server.start();
        console.log("HTTP Server running on %s", server.info.uri);  // Tampilkan URI server yang berjalan

    } catch (error) {
        console.error("Error starting the server:", error); // Tangani error saat memulai server
        process.exit(1);
    }
};

// Tangani unhandled promise rejection
process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);  // Keluar dari proses jika ada unhandled rejection
});

// Menjalankan fungsi init() untuk memulai server
init();
