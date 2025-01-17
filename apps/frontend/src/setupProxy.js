const { createProxyMiddleware } = require("http-proxy-middleware");

// Used in local development server only
module.exports = function(app) {
  const target = "http://localhost:8080";
  const headers = {
    "Nav-Consumer-Id": "teamsfrontend-local"
  };

  app.use(
    // remove later
    "/api",
    createProxyMiddleware({
      pathRewrite: {
        "^/api": ""
      },
      target,
      headers
    })
  );

  app.use(
    "/team-catalog",
    createProxyMiddleware({
      target,
      headers
    })
  );

  app.use(
    "/nom-api",
    createProxyMiddleware({
      target,
      headers
    })
  )

  app.use("/login", createProxyMiddleware({ target, headers }));
  app.use("/oauth2", createProxyMiddleware({ target, headers }));
  app.use("/logout", createProxyMiddleware({ target, headers }));
};
