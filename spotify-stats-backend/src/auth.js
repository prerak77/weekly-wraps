const axios = require("axios");
const querystring = require("querystring");

require("dotenv").config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

console.log({ client_id, client_secret, redirect_uri });

// Redirect user to Spotify's authorization page
const getAuthURL = () => {
  const scope = "user-top-read user-read-recently-played";
  return (
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
    })
  );
};

// Exchange authorization code for access token
const getAccessToken = async (code) => {
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    method: "post",
    params: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const response = await axios(authOptions);
    return response.data;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
};

module.exports = { getAuthURL, getAccessToken };
