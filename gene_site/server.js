// Create express app
const express = require("express");
const app = express();
const db = require('./db/database.js');

// Server port
const HTTP_PORT = 8000;

// CORS configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Start server
app.listen(HTTP_PORT, () => {
    console.log(`Server running on port ${HTTP_PORT}`);
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({"message": "Ok"});
});

// Get all gene data for histogram
app.get("/api/all_gene_data", (req, res) => {
    const sql = "SELECT * FROM gene_data";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Get effect size given gene_id
app.get("/api/get_effect_size/:gene_id", (req, res, next) => {
    var sql = "select Temp37_effect_size from gene_data where gene_id = ?";
    var params = [req.params.gene_id];
    console.log("Executing SQL query:", sql, params); // Add this line for debugging
    db.get(sql, params, (err, row) => {
        if (err) {
            console.error("Error executing query:", err); // Add this line for debugging
            res.status(500).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});


// Default response for any other request
app.use((req, res) => {
    res.status(404).json({"error": "Not Found"});
});
