const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();
const MAINTENANCE_MODE = true;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const pathname = parsedUrl.pathname || "/";
    const isAsset =
      pathname.startsWith("/_next") ||
      pathname === "/favicon.ico" ||
      pathname === "/icon.svg" ||
      /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname);

    if (MAINTENANCE_MODE && !isAsset) {
      parsedUrl.pathname = "/maintenance";
      parsedUrl.path = "/maintenance";
      req.url = "/maintenance";
    }

    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log("Skills Bangladesh listening on", port);
  });
});
