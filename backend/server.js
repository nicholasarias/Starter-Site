// Modern Backend Using Native Fetch
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());

// Basic test route
app.get("/", (req, res) => {
    res.send("Bible API is running with fetch()");
});

// Main verse lookup route
app.get("/api/verse", async (req, res) => {
    const reference = req.query.ref;

    if (!reference) {
        return res.status(400).json({ error: "Reference is required" });
    }

    try {
        const apiURL = `https://bible-api.com/${encodeURIComponent(reference)}?translation=asv`;

        // Call the Bible API using modern fetch
        const response = await fetch(apiURL);

        if (!response.ok) {
            return res.status(500).json({ error: "Bible API returned an error" });
        }

        const data = await response.json();

        res.json({
            reference: data.reference,
            text: data.text
        });

    } catch (err) {
        console.error("Error fetching verse:", err);
        res.status(500).json({ error: "Failed to fetch verse" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
