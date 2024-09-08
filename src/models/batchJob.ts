import { BatchResults } from './batchResults';

export interface BatchJob {
  id: number;
  name: string;
  script: string;
  activationTime: string;
  results: BatchResults | undefined;
}
