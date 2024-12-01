"use strict";

require('dotenv').config();
const Hapi = require("@hapi/hapi");
const Path = require("path");
const routes = require('./Routes');  // Mengimpor routing dari index.js

const init = async () => {
    try {
        const server = Hapi.server({
            port: process.env.PORT || 80,  // Pastikan port 80 digunakan
            host: "0.0.0.0"
        });

        // Register inert plugin untuk serve static file
        await server.register(require('@hapi/inert'));

        // Menambahkan route default untuk menyajikan file statis
        server.route({
            method: "GET",
            path: "/",
            handler: (request, h) => {
                return h.file(Path.join(__dirname, "Documentation", "index.html"));
            }
        });

        server.route(routes);

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
