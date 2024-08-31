import type { Request, Response } from "express";
import { getObservations } from "../services/indexService";
import { updateObservations } from "../services/updateService";
import { restartObservation } from "../services/observationService";

export const index = async (req: Request, res: Response) => {
  console.info("[info] index is called.");

  const observations = await getObservations();

  res.render("index", { observations });
};

export const update = async (req: Request, res: Response) => {
  console.info("[info] update is called.");

  try {
    const { index, name, filePath, pattern, script } = req.body;
    await updateObservations({ index, name, filePath, pattern, script });
    await restartObservation();

    res.redirect('/');
  } catch (error) {
    console.error('[error] Error updating observations:', error);

    res.status(500).send('An error occurred while updating observations.');
  }
}

export const notFound = (req: Request, res: Response) => {
  res.status(404).send("Not found");
};
