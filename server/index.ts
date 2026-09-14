import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createApp } from "./app.js";
import { loadServerConfig } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Fail-fast on invalid production configuration before binding the port.
  const config = loadServerConfig();

  // Serve static files from dist/public in production
  const staticPath =
    config.nodeEnv === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  const app = createApp(staticPath);
  const server = createServer(app);

  server.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}/`);
  });
}

startServer().catch(console.error);
