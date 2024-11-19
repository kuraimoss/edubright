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
  const httpServer = Hapi.server({
    port: 80,
    host: "0.0.0.0"
  });

  // Create HTTPS server
  const httpsServer = Hapi.server({
    port: 443,
    host: "0.0.0.0",
    tls: tlsOptions
  });

  // Register inert plugin to both servers
  await httpServer.register(require("@hapi/inert"));
  await httpsServer.register(require("@hapi/inert"));

  // Set routes for both servers
  const routes = require("./Routes");

  httpServer.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return h.file(Path.join(__dirname, "Documentation", "index.html"));
    }
  });
  httpServer.route(routes);

  httpsServer.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return h.file(Path.join(__dirname, "Documentation", "index.html"));
    }
  });
  httpsServer.route(routes);

  // Start both servers
  await httpServer.start();
  await httpsServer.start();
  console.log("HTTP Server running on %s", httpServer.info.uri);
  console.log("HTTPS Server running on %s", httpsServer.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
