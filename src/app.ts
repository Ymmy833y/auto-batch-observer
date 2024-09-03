import express, { Express } from "express";
import path from "path";
import * as controller from "./controllers";
import { beginFileObservation } from "./services/observationService";

export const createApp = (): Express => {
  const app: Express = express();

  app.set("view engine", "ejs");
  app.set('views', path.join(process.cwd(), 'views'));
  app.use('/static', express.static(path.join(process.cwd(), 'static')));

  app.use(express.urlencoded({ extended: false, limit: "25mb" }));

  app.get("/", controller.index);
  app.post("/update", controller.update);
  app.get("/events", controller.events);

  app.use(controller.notFound);

  return app;
};

export const initializeObservation = () => {
  console.info("[info] Start observing...");

  beginFileObservation();
};
