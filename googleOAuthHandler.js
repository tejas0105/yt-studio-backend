const getGoogleOAuthTokens = require("./getGoogleOAuthTokens");

const googleOAuthHandler = async (req, res) => {
  const code = req.query.code;
  const { access_token } = await getGoogleOAuthTokens(code);
  console.log({ access_token });
};

module.exports = googleOAuthHandler;
