"use strict";

require('dotenv').config();
const Hapi = require("@hapi/hapi");
const Path = require("path");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 8080, 
    host: "0.0.0.0", 
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
