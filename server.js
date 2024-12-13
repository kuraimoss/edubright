"use strict"; // Aktifkan mode strict untuk JavaScript

require('dotenv').config(); // Memuat variabel environment dari file .env
const Hapi = require("@hapi/hapi"); // Framework web server Hapi
const Path = require("path"); // Modul untuk memanipulasi path file
const routes = require('./Routes');  // Mengimpor routing dari Routes.js
const { checkAndDownloadModel } = require('./Utils/modelManager');  // Import fungsi pengecekan model

// Fungsi inisialisasi server
const init = async () => {
    try {
        // Periksa dan unduh model machine learning sebelum memulai server
        await checkAndDownloadModel();

        // Konfigurasi server Hapi
        const server = Hapi.server({
            port: process.env.PORT || 80,  // Gunakan port dari environment atau default 80
            host: "0.0.0.0"  // Listen pada semua network interface
        });

        // Register plugin inert untuk melayani file statis
        await server.register(require('@hapi/inert'));

        // Route default untuk menyajikan file statis
        server.route({
            method: 'GET',
            path: '/{param*}',
            handler: {
                directory: {
                    path: Path.join(__dirname, 'Documentation', 'index.html'), // Path ke direktori dokumentasi
                    listing: true,  // Izinkan listing direktori
                    index: true     // Gunakan file index
                }
            }
        });

        // Tambahkan route dari file Routes/index.js
        server.route(routes);

        // Memulai server
        await server.start();
        
        // Log informasi server yang berhasil dijalankan
        console.log('Server berjalan pada ' + server.info.uri);

    } catch (err) {
        // Tangani dan log error yang terjadi selama inisialisasi
        console.error('Terjadi kesalahan saat memulai server:', err);
    }
};

// Panggil fungsi inisialisasi server
init();