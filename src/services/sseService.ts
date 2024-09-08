import { Response } from 'express';
import { BatchResults, BatchTrigger } from '../models';

const clients: Response[] = [];
const batchResultsList: BatchResults[] = [];

export const addClient = (res: Response) => {
  clients.push(res);
};

export const removeClient = (res: Response) => {
  clients.filter((client) => client !== res);
};

export const sendBatchResults = (batchResults: BatchResults) => {
  const jsonData = JSON.stringify(batchResults);
  batchResultsList.push(batchResults);
  clients.forEach((client) => {
    client.write(`event: batchResults\ndata: ${jsonData}\n\n`);
  });
};

export const sendBatchTrigger = (batchTrigger: BatchTrigger) => {
  const jsonData = JSON.stringify(batchTrigger);  
  clients.forEach((client) => {
    client.write(`event: batchTrigger\ndata: ${jsonData}\n\n`);
  });
};

export const getBatchResultsList = (): BatchResults[] => {
  return batchResultsList;
};
