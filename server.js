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

  const server = Hapi.server({
    port: process.env.PORT || 80,
    host: "0.0.0.0",
    tls: tlsOptions // Enable HTTPS if tlsOptions are provided
  });

  await server.register(require("@hapi/inert"));

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return h.file(Path.join(__dirname, "Documentation", "index.html"));
    },
  });

  const routes = require("./Routes");
  server.route(routes);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
