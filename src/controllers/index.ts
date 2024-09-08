import type { Request, Response } from 'express';
import { getObservations } from '../services/indexService';
import { updateObservations } from '../services/updateService';
import { restartObservation } from '../services/observationService';
import { addClient, getBatchResultsList, removeClient } from '../services/sseService';

export const index = async (req: Request, res: Response) => {
  console.info('[info] index is called.');

  const batchResultsList = getBatchResultsList();
  const observations = await getObservations();

  res.render('index', { batchResultsList, observations });
};

export const update = async (req: Request, res: Response) => {
  console.info('[info] update is called.');

  try {
    const { index, name, filePath, pattern, script, remove } = req.body;
    await updateObservations({ index, name, filePath, pattern, script, remove });
    restartObservation();

    res.redirect('/');
  } catch (error) {
    console.error('[error] Error updating observations:', error);

    res.status(500).send('An error occurred while updating observations.');
  }
}

export const events = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); 

  addClient(res);

  req.on('close', () => {
    console.info('[info] Client connection closed');
    removeClient(res);
    res.end();
  });
}

export const notFound = (req: Request, res: Response) => {
  res.status(404).send('Not found');
};
