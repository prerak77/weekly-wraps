import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);

  // Check for data in the URL after Spotify login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");

    if (data) {
      const parsedData = JSON.parse(decodeURIComponent(data));
      setTopArtists(parsedData.topArtists);
      setTopTracks(parsedData.topTracks);
    } else {
      // Redirect to Spotify login if no data is found
      window.location.href = "http://localhost:3000/login";
    }
  }, []);

  return (
    <div className="App">
      <h1>Your Top Artists Listned to last Month</h1>
      {topArtists.length > 0 ? (
        <div className="grid-container">
          {topArtists.map((artist) => (
            <div key={artist.rank} className="artist-card">
              <div className="rank">{artist.rank}</div>
              <img
                src={artist.image}
                alt={artist.name}
                className="artist-image"
              />
              <div className="artist-name">{artist.name}</div>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <h1>Your Top Tracks Listned to last Month</h1>
      {topTracks.length > 0 && (
        <div className="grid-container">
          {topTracks.map((track) => (
            <div key={track.rank} className="track-card">
              <div className="rank">{track.rank}</div>
              <img src={track.image} alt={track.name} className="track-image" />
              <div className="track-name">{track.name}</div>
              <div className="track-artist">{track.artist}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
