import http, { Server } from "http";
import { createApp, initializeObservation } from "./app";
import config from "./config";
import { logger } from "./utils";

let server: Server;

const startServer = (): Promise<Server> => {
  const app = createApp();

  return new Promise((resolve, reject) => {
    server = http.createServer(app);

    server.listen(config.port, config.host, () => {
      logger.info(`Server is running on http://${config.host}:${config.port}`);
      resolve(server);
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      logger.error("Failed to start server: ", error);
      reject(error);
    });
  });
};

startServer()
  .then(() => initializeObservation())
  .catch((error) => {
    logger.error("Server failed to start: ", error);
  });

process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
    });
  }
});
