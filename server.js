"use strict";

require('dotenv').config();
const Hapi = require("@hapi/hapi");
const Path = require("path");
const fs = require('fs');

const init = async () => {
  // Setup HTTPS options if SSL certificate files are provided
  const tlsOptions = process.env.SSL_KEY && process.env.SSL_CERT ? {
    key: fs.readFileSync(process.env.SSL_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT)
  } : null;

  // Create HTTP server
  const server = Hapi.server({
    port: process.env.PORT || 80,
    host: "0.0.0.0"
  });

  // Register inert plugin
  await server.register(require("@hapi/inert"));

  // Set routes for HTTP and HTTPS
  const routes = require("./Routes");

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return h.file(Path.join(__dirname, "Documentation", "index.html"));
    }
  });
  server.route(routes);

  // Start HTTP server
  await server.start();
  console.log("HTTP/HTTPS Server running on %s", server.info.uri);

  // If TLS options are provided, start HTTPS server
  if (tlsOptions) {
    const httpsServer = Hapi.server({
      port: 443,
      host: "0.0.0.0",
      tls: tlsOptions
    });

    await httpsServer.register(require("@hapi/inert"));

    httpsServer.route({
      method: "GET",
      path: "/",
      handler: (request, h) => {
        return h.file(Path.join(__dirname, "Documentation", "index.html"));
      }
    });
    httpsServer.route(routes);

    await httpsServer.start();
    console.log("HTTPS Server running on %s", httpsServer.info.uri);
  }
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
