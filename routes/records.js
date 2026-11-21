const express = require("express");
const router = express.Router();

const pool = require("../db");

// Validate the record ID
function validateId(id) {
    return /^\d+$/.test(id) && Number(id) > 0;
}

// Validate request information
function validateRecord(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "A valid JSON object is required.";
    }

    // The database generates IDs automatically
    if ("id" in body) {
        return "Do not provide an ID. It is generated automatically.";
    }

    const fields = ["title", "category", "description", "status"];

    for (const field of fields) {
        if (typeof body[field] !== "string") {
            return `${field} must be provided as text.`;
        }

        body[field] = body[field].trim();

        if (body[field].length === 0) {
            return `${field} cannot be empty.`;
        }
    }

    if (body.title.length < 3 || body.title.length > 80) {
        return "Title must contain between 3 and 80 characters.";
    }

    if (body.category.length < 2 || body.category.length > 40) {
        return "Category must contain between 2 and 40 characters.";
    }

    if (body.description.length < 5 || body.description.length > 300) {
        return "Description must contain between 5 and 300 characters.";
    }

    const allowedStatuses = ["Pending", "In progress", "Completed"];

    if (!allowedStatuses.includes(body.status)) {
        return "Status must be Pending, In progress, or Completed.";
    }

    return null;
}

// GET: Retrieve all records
router.get("/", async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT * FROM records ORDER BY id ASC"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
});

// GET: Retrieve one record by ID
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateId(id)) {
            return res.status(400).json({
                message: "Invalid record ID."
            });
        }

        const result = await pool.query(
            "SELECT * FROM records WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// POST: Create a new record
router.post("/", async (req, res, next) => {
    try {
        const validationError = validateRecord(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const { title, category, description, status } = req.body;

        const result = await pool.query(
            `INSERT INTO records (title, category, description, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [title, category, description, status]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// PUT: Update an existing record
router.put("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateId(id)) {
            return res.status(400).json({
                message: "Invalid record ID."
            });
        }

        const validationError = validateRecord(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const { title, category, description, status } = req.body;

        const result = await pool.query(
            `UPDATE records
             SET title = $1,
                 category = $2,
                 description = $3,
                 status = $4
             WHERE id = $5
             RETURNING *`,
            [title, category, description, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// DELETE: Remove a record
router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateId(id)) {
            return res.status(400).json({
                message: "Invalid record ID."
            });
        }

        const result = await pool.query(
            "DELETE FROM records WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json({
            message: "Record deleted."
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;