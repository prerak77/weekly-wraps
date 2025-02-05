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
    // Exchange authorization code for access token
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

    // Fetch data using the access token
    const dataResponse = await axios.get("http://localhost:3000/data", {
      params: { access_token },
    });

    // Redirect to the React app with the data as query parameters
    res.redirect(
      `http://localhost:3001?data=${encodeURIComponent(
        JSON.stringify(dataResponse.data)
      )}`
    );
  } catch (error) {
    console.error(
      "Error during authentication or fetching data:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ error: "Error during authentication or fetching data." });
  }
});

app.get("/top-artists", async (req, res) => {
  const access_token = req.query.access_token;

  try {
    const artistsResponse = await axios.get(
      "https://api.spotify.com/v1/me/top/artists",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { time_range: "short_term", limit: 10 },
      }
    );

    const topArtists = artistsResponse.data.items.map((artist, index) => ({
      rank: index + 1,
      name: artist.name,
      image: artist.images[0]?.url || null,
    }));

    res.json({ topArtists });
  } catch (error) {
    console.error("Error fetching top artists:", error);
    res.status(500).json({ error: "Error fetching top artists." });
  }
});

app.get("/data", async (req, res) => {
  const access_token = req.query.access_token;

  if (!access_token) {
    return res.status(400).json({ error: "Access token is required." });
  }

  try {
    // Fetch top artists
    const artistsResponse = await axios.get(
      "https://api.spotify.com/v1/me/top/artists",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { time_range: "short_term", limit: 10 },
      }
    );

    const topArtists = artistsResponse.data.items.map((artist, index) => ({
      rank: index + 1,
      name: artist.name,
      image: artist.images[0]?.url || null,
    }));

    // Fetch top tracks
    const tracksResponse = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { time_range: "short_term", limit: 10 },
      }
    );

    const topTracks = tracksResponse.data.items.map((track, index) => ({
      rank: index + 1,
      name: track.name,
      artist: track.artists[0].name,
      image: track.album.images[0]?.url || null,
    }));

    // Send the response with top artists and tracks
    res.json({ topArtists, topTracks });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data." });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/login`);
});
