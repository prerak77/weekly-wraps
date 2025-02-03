const express = require("express");
const axios = require("axios");
const router = express.Router();

// Fetch top artists
router.get("/top-artists", async (req, res) => {
  const access_token = req.query.access_token;
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/top/artists",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { time_range: "short_term", limit: 10 },
      }
    );

    // Log the top artists to the console
    console.log("Top Artists:");
    response.data.items.forEach((artist, index) => {
      console.log(
        `${index + 1}. ${artist.name} - Popularity: ${
          artist.popularity
        }, Genres: ${artist.genres.join(", ")}`
      );
    });

    // Send the response to the client
    res.json(response.data.items);
  } catch (error) {
    console.error("Error fetching top artists:", error);
    res.status(500).json({ error: "Error fetching top artists" });
  }
});

// Fetch top tracks
router.get("/top-tracks", async (req, res) => {
  const access_token = req.query.access_token;
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { time_range: "short_term", limit: 10 },
      }
    );

    // Log the top tracks to the console (optional)
    console.log("Top Tracks:");
    response.data.items.forEach((track, index) => {
      console.log(
        `${index + 1}. ${track.name} by ${
          track.artists[0].name
        } - Popularity: ${track.popularity}`
      );
    });

    // Send the response to the client
    res.json(response.data.items);
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    res.status(500).json({ error: "Error fetching top tracks" });
  }
});

module.exports = router;
