import fs from "fs";
import chokidar from "chokidar";
import { exec } from "child_process";
import { isObservations, Observation, Watcher } from "../models";
import {
  checkFileExists,
  getFileEncoding,
  getFileSize,
  readObservationJson,
} from "../utils";
import { sendLog } from "./sseService";
import { getCurrentDate } from "../utils/dateUtil";

let watchers: Watcher[] = [];

const beginFileObservation = async () => {
  const jsonData = await readObservationJson();
  if (!jsonData) {
    console.warn("[warn] Failed to load observations data.");
    return;
  }

  if (!isObservations(jsonData)) {
    console.warn("[warn] No files to be observed have been set.");
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

  w.watcher.on("add", async (file: string) => {
    console.info(`[info] Observe file: ${file}`);
    const size = await getFileSize(file);
    w.lastReadPositionMap.set(file, size);
  });

  w.watcher.on("change", async (file: string) => {
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
      .on("data", (chunk) => {
        const changeContent = Buffer.isBuffer(chunk)
          ? chunk.toString(encoding)
          : chunk;

        for (const trigger of w.observation.triggers) {
          if (changeContent.includes(trigger.pattern)) {
            console.info(`[info] Triggered the script: ${trigger.script}`);
            runCommand(trigger.script)
              .then((res) => {
                console.info(`[info] Command executed successfully: ${res}`);
                sendLog({
                  name: w.observation.name,
                  script: trigger.script,
                  isSuccess: true,
                  body: res,
                  date: getCurrentDate(),
                });
              })
              .catch((err) => {
                console.error(`[error] ${err}`);
                sendLog({
                  name: w.observation.name,
                  script: trigger.script,
                  isSuccess: false,
                  body: err,
                  date: getCurrentDate(),
                });
              });
          }
        }
      })
      .on("end", () => {
        w.lastReadPositionMap.set(file, size);
      })
      .on("error", (err) => {
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
        return reject(`Command stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

const finishFileObservation = () => {
  watchers.forEach((w) => w.watcher.close());
  watchers = [];
};

const restartObservation = async () => {
  console.info("[info] Restart observing...");
  finishFileObservation();
  await beginFileObservation();
};

export { beginFileObservation, finishFileObservation, restartObservation };
