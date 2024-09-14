import fs from 'fs';
import chokidar from 'chokidar';
import { exec } from 'child_process';
import { isObservations, Observation, Watcher } from '../models';
import {
  checkFileExists,
  getFileEncoding,
  getFileSize,
  readObservationJson,
  getCurrentDate,
} from '../utils';
import {
  getBatchJobId,
  sendBatchResults,
  sendBatchTrigger,
} from './sseService';

const watchers: Watcher[] = [];

const beginFileObservation = async () => {
  const jsonData = await readObservationJson();
  if (!jsonData) {
    console.warn('[warn] Failed to load observations data.');
    return;
  }

  if (!isObservations(jsonData)) {
    console.warn('[warn] No files to be observed have been set.');
    return;
  }

  jsonData.observations.forEach(initializeListeners);
};

const initializeListeners = (observation: Observation) => {
  if (!checkFileExists(observation.filePath)) {
    console.warn(`File does not exist: ${observation.filePath}`);
    return;
  }
  const w: Watcher = {
    observation,
    watcher: chokidar.watch(observation.filePath, {
      persistent: true,
      usePolling: true,
      interval: 1000,
    }),
    lastReadPositionMap: new Map(),
  };

  w.watcher.on('add', async (file: string) => {
    console.info(`[info] Observe file: ${file}`);
    const size = await getFileSize(file);
    w.lastReadPositionMap.set(file, size);
  });

  w.watcher.on('change', async (file: string) => {
    console.info(`[info] File ${file} has been changed!`);

    const size = await getFileSize(file);
    const lastReadPosition = w.lastReadPositionMap.get(file) ?? 0;
    const encoding = getFileEncoding(file);
    if (size <= lastReadPosition) {
      return;
    }

    fs.createReadStream(file, {
      start: lastReadPosition,
      end: size - 1,
      encoding,
    })
      .on('data', (chunk) => {
        const changeContent = Buffer.isBuffer(chunk)
          ? chunk.toString(encoding)
          : chunk;

        for (const trigger of w.observation.triggers) {
          if (changeContent.includes(trigger.pattern)) {
            console.info(`[info] Triggered the script: ${trigger.script}`);
            const id = getBatchJobId();
            sendBatchTrigger({
              id,
              name: w.observation.name,
              script: trigger.script,
              activationTime: getCurrentDate(),
              results: undefined,
            });
            runCommand(trigger.script)
              .then((res) => {
                console.info(`[info] Command executed successfully: ${res}`);
                sendBatchResults({
                  id,
                  isSuccess: true,
                  body: res,
                  completionTime: getCurrentDate(),
                });
              })
              .catch((err) => {
                console.error(`[error] ${err}`);
                sendBatchResults({
                  id,
                  isSuccess: false,
                  body: err,
                  completionTime: getCurrentDate(),
                });
              });
          }
        }
      })
      .on('end', () => {
        w.lastReadPositionMap.set(file, size);
      })
      .on('error', (err) => {
        console.error(
          `[error] An error occurred while loading the file: ${err}`
        );
      });
  });

  watchers.push(w);
};

const runCommand = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error executing command: ${error.message}`);
      }
      if (stderr) {
        console.warn(`[warn] Command stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

const finishFileObservation = async () => {
  await Promise.all(watchers.map((w) => w.watcher.close()));
  watchers.length = 0;
};

const restartObservation = async () => {
  console.info('[info] Restart observing...');
  await finishFileObservation();
  await beginFileObservation();
};

export {
  watchers,
  beginFileObservation,
  finishFileObservation,
  restartObservation,
};
