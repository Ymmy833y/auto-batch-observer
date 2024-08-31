import http, { Server } from "http";
import { createApp, initializeObservation } from "./app";
import config from "./config";

let server: Server;

const startServer = (): Promise<Server> => {
  const app = createApp();

  return new Promise((resolve, reject) => {
    server = http.createServer(app);

    server.listen(config.port, config.host, () => {
      console.info(`[info] Server is running on http://${config.host}:${config.port}`);
      resolve(server);
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      console.error("[error] Failed to start server: ", error);
      reject(error);
    });
  });
};

startServer()
  .then(() => initializeObservation())
  .catch((error) => {
    console.error("[error] Server failed to start: ", error);
  });

process.on("SIGTERM", () => {
  console.info("[info] SIGTERM signal received: closing HTTP server");
  if (server) {
    server.close(() => {
      console.info("[info] HTTP server closed");
    });
  }
});
