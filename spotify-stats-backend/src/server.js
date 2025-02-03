const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");
const querystring = require("querystring");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.use(cors());
app.use(express.json());

// Redirect to Spotify login
app.get("/login", (req, res) => {
  const scope = "user-top-read";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
      })
  );
});

// Handle Spotify callback
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const access_token = tokenResponse.data.access_token;

    // Fetch and log top artists and tracks
    const artistsResponse = await axios.get(
      "https://api.spotify.com/v1/me/top/artists",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { time_range: "short_term", limit: 10 },
      }
    );

    console.log("Top Artists:");
    artistsResponse.data.items.forEach((artist, index) => {
      console.log(`${index + 1}. ${artist.name}`);
    });

    const tracksResponse = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { time_range: "short_term", limit: 10 },
      }
    );

    console.log("\nTop Tracks:");
    tracksResponse.data.items.forEach((track, index) => {
      console.log(`${index + 1}. ${track.name} by ${track.artists[0].name}`);
    });

    res.send(
      "Login successful! Check your backend console for top artists and tracks."
    );
  } catch (error) {
    console.error(
      "Error during authentication or fetching data:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error during authentication or fetching data.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/login`);
});
