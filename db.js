require("dotenv").config();

const { Pool } = require("pg");

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: false
    };

const pool = new Pool(poolConfig);

pool.on("error", (error) => {
    console.error("Unexpected database error:", error);
});

module.exports = pool;