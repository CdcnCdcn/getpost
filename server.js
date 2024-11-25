const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const cors = require("cors");

// Supabase-Daten
const supabaseUrl = "https://ltzvbzpeplnjlokvbuit.supabase.co";
const supabaseKey = "your-supabase-key";
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const port = process.env.PORT || 3000;

// CORS Middleware
app.use(cors({
    origin: "https://reviergold.de", // Erlaubter Ursprung
    methods: ["GET", "POST", "OPTIONS"], // Zulässige Methoden
    allowedHeaders: ["Content-Type", "Authorization"], // Zulässige Header
    credentials: true, // Wenn Cookies übermittelt werden
}));

// Middleware für JSON-Verarbeitung
app.use(bodyParser.json());

// Preflight-Request (OPTIONS) beantworten
app.options("/api/saveResults", (req, res) => {
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Origin", "https://reviergold.de");
    res.sendStatus(200);
});

// Grundlegende Route
app.get("/", (req, res) => {
    res.send("Server läuft! Willkommen bei deinem Node.js-Projekt.");
});

// API-Route für das Speichern von Ergebnissen
app.post("/api/saveResults", async (req, res) => {
    const answers = req.body;

    try {
        const entries = Object.entries(answers).map(([question_key, answer]) => ({
            question_key,
            answer,
        }));

        // Daten in die Tabelle 'results' einfügen
        const { data, error } = await supabase.from("results").insert(entries);

        if (error) {
            console.error("Fehler beim Speichern:", error);
            return res.status(500).send("Fehler beim Speichern der Ergebnisse.");
        }

        res.status(200).send({ message: "Ergebnisse erfolgreich gespeichert." });
    } catch (err) {
        console.error("Server-Fehler:", err);
        res.status(500).send("Ein Fehler ist aufgetreten.");
    }
});

// API-Route für das Abrufen der Ergebnisse
app.get("/api/getResults", async (req, res) => {
    try {
        const { data, error } = await supabase.from("results").select("*");

        if (error) {
            console.error("Fehler beim Abrufen der Ergebnisse:", error);
            return res.status(500).send("Fehler beim Abrufen der Ergebnisse.");
        }

        res.status(200).send(data);
    } catch (err) {
        console.error("Server-Fehler:", err);
        res.status(500).send("Ein Fehler ist aufgetreten.");
    }
});

// Server starten
app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});
