"use strict";

require('dotenv').config();
const Hapi = require("@hapi/hapi");
const Path = require("path");
const sentiment = require('./Routes/sentiment'); // Memastikan import file sentiment.js dengan benar

const init = async () => {
    try {
        // Memuat model dan tokenizer sebelum memulai server
        await sentiment.loadModel();  // Pastikan loadModel dipanggil untuk memuat model
        console.log("Model successfully loaded.");

        const server = Hapi.server({
            port: process.env.PORT || 80,  // Pastikan port 80 digunakan
            host: "0.0.0.0"
        });

        // Register inert plugin untuk serve static file
        await server.register(require('@hapi/inert'));

        server.route({
            method: "GET",
            path: "/",
            handler: (request, h) => {
                return h.file(Path.join(__dirname, "Documentation", "index.html"));
            }
        });

        // Register routes untuk analisis sentimen
        server.route(sentiment.routes);  // Pastikan routes yang benar dipakai

        // Start server
        await server.start();
        console.log("HTTP Server running on %s", server.info.uri);

    } catch (error) {
        console.error("Error starting the server:", error);
        process.exit(1);
    }
};

process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
});

init();
