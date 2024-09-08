import { Response } from 'express';
import { BatchJob, BatchResults } from '../models';

const clients: Response[] = [];
const batchJobList: BatchJob[] = [];

export const addClient = (res: Response) => {
  clients.push(res);
};

export const removeClient = (res: Response) => {
  clients.filter((client) => client !== res);
};

export const sendBatchResults = (batchResults: BatchResults) => {
  batchJobList[batchResults.id].results = batchResults;
  const jsonData = JSON.stringify(batchJobList[batchResults.id]);
  clients.forEach((client) => {
    client.write(`event: batchResults\ndata: ${jsonData}\n\n`);
  });
};

export const sendBatchTrigger = (batchJob: BatchJob) => {
  const jsonData = JSON.stringify(batchJob);  
  batchJobList.push(batchJob);
  clients.forEach((client) => {
    client.write(`event: batchTrigger\ndata: ${jsonData}\n\n`);
  });
};

export const getBatchJobList = (): BatchJob[] => {
  return batchJobList;
};

export const getBatchJobId = () => {
  return batchJobList.length;
}
