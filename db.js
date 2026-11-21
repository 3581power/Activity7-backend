const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, ".env"),
    override: true
});

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: false
});

pool.on("error", (error) => {
    console.error("Unexpected database error:", error);
});

module.exports = pool;