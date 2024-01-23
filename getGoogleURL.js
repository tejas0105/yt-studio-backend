function getGoogleOAuthURL() {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: "http://localhost:3000/oauth",
    client_id: process.env.CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "openid",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/youtube.force-ssl",
    ].join(" "),
  };
  console.log({ options });
  const qs = new URLSearchParams(options);
  console.log(qs.toString());
  return `${rootUrl}?${qs.toString()}`;
}

module.exports = getGoogleOAuthURL;
