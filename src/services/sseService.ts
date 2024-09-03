import { Response } from "express";
import { BatchResults } from "../models";

let clients: Response[] = [];
let batchResults: BatchResults[] = [];

export const addClient = (res: Response) => {
  clients.push(res);
};

export const removeClient = (res: Response) => {
  clients = clients.filter((client) => client !== res);
};

export const sendLog = (batchResult: BatchResults) => {
  const log = JSON.stringify(batchResult);
  batchResults.push(batchResult);
  clients.forEach((client) => {
    client.write(`data: ${log}\n\n`);
  });
};

export const getBatchResults = (): BatchResults[] => {
  return batchResults;
};
