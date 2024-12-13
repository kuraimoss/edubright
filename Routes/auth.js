require("dotenv").config(); // Memuat variabel environment dari file .env
const Joi = require("joi"); // Library untuk validasi input
const bcrypt = require("bcrypt"); // Library untuk hashing password
const jwt = require("jsonwebtoken"); // Library untuk membuat JSON Web Token
const db = require("../database"); // Modul koneksi database
const { v4: uuidv4 } = require("uuid"); // Library untuk membuat UUID unik

// Mengambil secret key untuk JWT dari environment variable
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = [
  {
    // Route untuk registrasi pengguna baru
    method: "POST",
    path: "/register",
    options: {
      // Validasi input menggunakan Joi
      validate: {
        payload: Joi.object({
          name: Joi.string().min(3).required(), // Nama minimal 3 karakter
          email: Joi.string().email().required(), // Email harus valid
          password: Joi.string().min(6).required(), // Password minimal 6 karakter
        }),
      },
    },
    handler: async (request, h) => {
      const { name, email, password } = request.payload;

      try {
        // Hash password untuk keamanan
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat UUID unik untuk user
        const userId = uuidv4();

        // Query untuk menyimpan user baru ke database
        const [result] = await db.query(
          "INSERT INTO users (user_id, nama, email, password) VALUES (?, ?, ?, ?)",
          [userId, name, email, hashedPassword]
        );

        // Respon sukses jika registrasi berhasil
        return h
          .response({
            status: "success",
            message: "User registered successfully!",
            registerResult: { userId, name, email },
          })
          .code(201);
      } catch (err) {
        // Penanganan berbagai error yang mungkin terjadi
        console.error("Database Error: ", err);
        let errorMessage = "Failed to register user.";
        let registerResult = null;

        // Penanganan error spesifik
        if (err.code === "ER_DUP_ENTRY") {
          errorMessage = "The email address is already registered.";
          registerResult = { userId: "duplicate", name, email };
        } else if (err.code === "ER_DATA_TOO_LONG") {
          errorMessage =
            "Data too long for one of the fields. Please check the input values.";
        } else if (err.code === "WARN_DATA_TRUNCATED") {
          errorMessage =
            "Data truncated. Please ensure all fields are correctly formatted.";
        }

        // Respon error jika registrasi gagal
        return h
          .response({
            status: "error",
            error: errorMessage,
            details: err.message,
            registerResult,
          })
          .code(500);
      }
    },
  },
  {
    // Route GET /register ditolak
    method: "GET",
    path: "/register",
    handler: (request, h) => {
      return h.file('Documentation/denied.html').code(403);
    },
  },
  {
    // Route GET /login ditolak
    method: "GET",
    path: "/login",
    handler: (request, h) => {
      return h.file('Documentation/denied.html').code(403);
    },
  },
  {
    // Route untuk login pengguna
    method: "POST",
    path: "/login",
    options: {
      // Validasi input login
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required(),
        }),
      },
    },
    handler: async (request, h) => {
      const { email, password } = request.payload;

      try {
        // Cari user berdasarkan email
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
          email,
        ]);
        
        // Jika user tidak ditemukan
        if (rows.length === 0) {
          return h
            .response({
              status: "error",
              error:
                "User not found. Please check the email address and try again.",
              details: "No user found with the provided email address.",
            })
            .code(404);
        }

        const user = rows[0];

        // Verifikasi password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return h
            .response({
              status: "error",
              error:
                "Invalid credentials. Please check your password and try again.",
              details: "The provided password is incorrect.",
            })
            .code(401);
        }

        // Buat token JWT
        const token = jwt.sign(
          { userId: user.user_id, email: user.email },
          JWT_SECRET,
          {
            expiresIn: "1h", // Token berlaku selama 1 jam
          }
        );

        // Respon sukses login
        return h
          .response({
            status: "success",
            message: "Login successful!",
            loginResult: {
              token,
              userId: user.user_id,
              name: user.nama,
              email: user.email,
            },
          })
          .code(200);
      } catch (err) {
        // Penanganan error database
        console.error("Database Error: ", err);
        let errorMessage = "Failed to login.";
        let loginResult = { userId: null, email };

        // Penanganan error spesifik
        if (err.code === "ER_ACCESS_DENIED_ERROR") {
          errorMessage =
            "Access denied. Please check your database credentials.";
        }

        // Respon error login
        return h
          .response({
            status: "error",
            error: errorMessage,
            details: err.message,
            loginResult,
          })
          .code(500);
      }
    },
  },
];