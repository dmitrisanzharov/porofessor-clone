const fs = require("fs");
const path = require("path");

const https = require("https");
const axios = require("axios");
const express = require("express");

// const leagueAuthObj = {
//     process: "LeagueClient",
//     pid: 8784,
//     port: 61814,
//     password: "kQQSbJexg_oi8MjI7IWifQ",
//     protocol: "https"
// };

const lockfilePath = "C:\\Riot Games\\League of Legends\\lockfile";
const lockfile = fs.readFileSync(lockfilePath, "utf-8").split(":");

const league_port = lockfile[2];
const league_password = lockfile[3];

const app = express();
const SERVER_PORT = 3001;

/* Axios client for LCU */
const lcuClient = axios.create({
    baseURL: `https://127.0.0.1:${league_port}`,
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    auth: {
        username: "riot",
        password: league_password
    }
});

/* Health check */
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// /* Gameflow phase */
app.get("/api/gameflow", async (req, res) => {
    try {
        const response = await lcuClient.get("/lol-gameflow/v1/gameflow-phase");

        res.json({ phase: response.data });
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch gameflow",
            details: err.message
        });
    }
});

// /* Lobby info */
app.get("/api/lobby", async (req, res) => {
    try {
        const response = await lcuClient.get("/lol-lobby/v2/lobby");

        res.json(response.data);
    } catch (err) {
        if (err.response?.status === 404) {
            res.status(200).json({ inLobby: false });
        } else {
            res.status(500).json({
                error: "Failed to fetch lobby",
                details: err.message
            });
        }
    }
});

/* Start server */
app.listen(SERVER_PORT, () => {
    console.log(`Server Started... LCU bridge running on http://localhost:${SERVER_PORT}`);
});
