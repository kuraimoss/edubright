"use strict";

require('dotenv').config();
const Hapi = require("@hapi/hapi");
const Path = require("path");
const routes = require('./Routes');  // Mengimpor routing dari Routes.js
const { checkAndDownloadModel } = require('./Utils/modelManager');  // Import fungsi pengecekan model

const init = async () => {
    try {
        // Periksa dan unduh model sebelum memulai server
        await checkAndDownloadModel();

        const server = Hapi.server({
            port: process.env.PORT || 80,  // Pastikan port 80 digunakan
            host: "0.0.0.0"
        });

        // Register inert plugin untuk serve static file
        await server.register(require('@hapi/inert'));

        // Menambahkan route default untuk menyajikan file statis
        server.route({
            method: 'GET',
            path: '/{param*}',
            handler: {
                directory: {
                    path: Path.join(__dirname, 'Documentation', 'index.html'),
                    listing: true,
                    index: true
                }
            }
        });

        // Menambahkan routing lainnya dari Routes/index.js
        server.route(routes);

        // Memulai server
        await server.start();
        console.log('Server berjalan pada ' + server.info.uri);

    } catch (err) {
        console.error('Terjadi kesalahan saat memulai server:', err);
    }
};

// Memulai server
init();
