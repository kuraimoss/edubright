require("dotenv").config();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database");
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = [
  {
    method: "POST",
    path: "/register",
    options: {
      validate: {
        payload: Joi.object({
          name: Joi.string().min(3).required(),
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required(),
        }),
      },
    },
    handler: async (request, h) => {
      const { name, email, password } = request.payload;

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = uuidv4();

        const [result] = await db.query(
          "INSERT INTO users (user_id, nama, email, password) VALUES (?, ?, ?, ?)",
          [userId, name, email, hashedPassword]
        );

        return h
          .response({
            status: "success",
            message: "User registered successfully!",
            registerResult: { userId, name, email },
          })
          .code(201);
      } catch (err) {
        console.error("Database Error: ", err);
        let errorMessage = "Failed to register user.";
        let registerResult = null;

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
    method: "GET",
    path: "/register",
    handler: (request, h) => {
      return h.file('Documentation/denied.html').code(403);
    },
  },
  {
    method: "GET",
    path: "/login",
    handler: (request, h) => {
      return h.file('Documentation/denied.html').code(403);
    },
  },
  {
    method: "POST",
    path: "/login",
    options: {
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
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
          email,
        ]);
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

        const token = jwt.sign(
          { userId: user.user_id, email: user.email },
          JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

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
        console.error("Database Error: ", err);
        let errorMessage = "Failed to login.";
        let loginResult = { userId: null, email };

        if (err.code === "ER_ACCESS_DENIED_ERROR") {
          errorMessage =
            "Access denied. Please check your database credentials.";
        }

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

