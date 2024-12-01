const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "34.128.81.134",
  user: "edubright_user",
  password: "KURA123@KURA",
  database: "edubright_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise();
