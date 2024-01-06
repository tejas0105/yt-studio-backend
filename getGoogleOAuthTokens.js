const axios = require("axios");
const qs = require("qs");

const getGoogleOAuthTokens = async (code) => {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id:
      "247274883287-om7o76pfqeb1srf1m500l8gt0c6effes.apps.googleusercontent.com",
    client_secret: "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",
    redirect_uri: "http://localhost:3000/oauth",
    grant_type: "authorization_code",
  };
  try {
    const res = await axios.post(url, qs.stringify(values), {
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = getGoogleOAuthTokens;
