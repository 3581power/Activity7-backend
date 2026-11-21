// Load environment variables
require("dotenv").config();

// Import required packages
const express = require("express");
const cors = require("cors");

// Import database connection
const pool = require("./db");

// Create Express application
const app = express();

// Read permitted frontend addresses
const origins = (process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

// Enable CORS
app.use(cors({
    origin: origins.length ? origins : true
}));

// Allow the server to receive JSON
app.use(express.json());

// Project information
const projectName = "Campus Maintenance Requests";
const studentNumber = "202503581";

// HOME ROUTE: API GUIDE
app.get("/", (req, res) => {

    const baseURL = `${req.protocol}://${req.get("host")}`;

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <title>Campus Maintenance API Guide</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #eef3ff;
                    margin: 30px;
                    color: #172554;
                }

                .container {
                    max-width: 950px;
                    margin: auto;
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                }

                h1, h2 {
                    color: #1745b5;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th, td {
                    border: 1px solid #ccc;
                    padding: 12px;
                    text-align: left;
                }

                th {
                    background: #dce8ff;
                }

                code, pre {
                    background: #edf2ff;
                    padding: 10px;
                    border-radius: 5px;
                }

                a {
                    color: #1745b5;
                }
            </style>
        </head>

        <body>
            <div class="container">

                <h1>${projectName} API</h1>

                <p><strong>Student Number:</strong> ${studentNumber}</p>

                <p>
                    This backend allows users to create, view, update
                    and delete campus maintenance requests.
                </p>

                <h2>API Base URL</h2>
                <p>${baseURL}</p>

                <h2>Important Links</h2>

                <p>
                    <a href="/health">Check API Health</a>
                </p>

                <p>
                    <a href="/api/records">View All Maintenance Records</a>
                </p>

                <h2>Available API Routes</h2>

                <table>
                    <tr>
                        <th>Method</th>
                        <th>Route</th>
                        <th>Purpose</th>
                    </tr>

                    <tr>
                        <td>GET</td>
                        <td>/</td>
                        <td>Display API guide</td>
                    </tr>

                    <tr>
                        <td>GET</td>
                        <td>/health</td>
                        <td>Check server and database</td>
                    </tr>

                    <tr>
                        <td>GET</td>
                        <td>/api/records</td>
                        <td>Get all records</td>
                    </tr>

                    <tr>
                        <td>GET</td>
                        <td>/api/records/:id</td>
                        <td>Get one record</td>
                    </tr>

                    <tr>
                        <td>POST</td>
                        <td>/api/records</td>
                        <td>Create a record</td>
                    </tr>

                    <tr>
                        <td>PUT</td>
                        <td>/api/records/:id</td>
                        <td>Update a record</td>
                    </tr>

                    <tr>
                        <td>DELETE</td>
                        <td>/api/records/:id</td>
                        <td>Delete a record</td>
                    </tr>
                </table>

                <h2>Required Input Fields</h2>

                <ul>
                    <li>title: 3 to 80 characters</li>
                    <li>category: 2 to 40 characters</li>
                    <li>description: 5 to 300 characters</li>
                    <li>status: Pending, In progress or Completed</li>
                </ul>

                <h2>Example POST or PUT JSON Body</h2>

                <pre>
{
    "title": "Broken Classroom Light",
    "category": "Electrical",
    "description": "The light in Room B12 does not switch on.",
    "status": "Pending"
}
                </pre>

                <h2>Response Status Codes</h2>

                <ul>
                    <li>200: Successful request</li>
                    <li>201: Record successfully created</li>
                    <li>400: Invalid input or malformed JSON</li>
                    <li>404: Record or route not found</li>
                    <li>500: Unexpected server error</li>
                    <li>503: Database unavailable</li>
                </ul>

                <p>
                    Note: An idle hosted service may need some time
                    to start responding to requests.
                </p>

            </div>
        </body>
        </html>
    `);
});

// HEALTH ROUTE
app.get("/health", async (req, res) => {

    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "OK",
            message: "Server and database are working."
        });

    } catch (error) {
        console.error("Health check failed:", error);

        res.status(503).json({
            message: "Database is unavailable."
        });
    }
});

// RECORD ROUTES
app.use("/api/records", require("./routes/records"));

// HANDLE UNKNOWN ROUTES
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

// HANDLE ERRORS
app.use((error, req, res, next) => {

    console.error(error);

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({
            message: "Malformed JSON request."
        });
    }

    res.status(500).json({
        message: "An unexpected server error occurred."
    });
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Campus Maintenance API running on port ${PORT}`);
});