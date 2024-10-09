import * as fs from "fs";
import * as chardet from "chardet";
import { isObservations, Observations } from "../models";
import config from "../config";
import logger from "./logger";

export const checkFileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

export const getFileSize = async (file: string): Promise<number> => {
  return fs.promises
    .stat(file)
    .then((stats) => stats.size)
    .catch((error) => {
      logger.error(`Failed to get file information: ${error}`);
      return 0;
    });
};

export const getFileEncoding = (filePath: string): BufferEncoding => {
  const buffer = fs.readFileSync(filePath, { encoding: null });

  try {
    const detectedEncoding = chardet.detect(buffer);

    if (detectedEncoding && isBufferEncoding(detectedEncoding)) {
      return detectedEncoding as BufferEncoding;
    } else {
      throw new Error("Detected encoding is not a valid BufferEncoding.");
    }
  } catch (error) {
    logger.warn(`Encoding not detected: ${error}, using 'utf-8'`);
    return "utf-8";
  }
};

const isBufferEncoding = (encoding: string): encoding is BufferEncoding => {
  return Buffer.isEncoding(encoding);
};

export const readObservationJson = async (): Promise<
  Observations | undefined
> => {
  const data = await fs.promises.readFile(config.dataFilePath, "utf-8");
  try {
    const parsedData = JSON.parse(data);
    if (isObservations(parsedData)) {
      return parsedData;
    } else {
      logger.warn("Parsed JSON is not in the expected Observations format");
      return undefined;
    }
  } catch (error) {
    logger.error("Error parsing JSON:", String(error));
    return undefined;
  }
};

export const writeObservationJson = async (
  data: Observations
): Promise<void> => {
  const jsonData = JSON.stringify(data, null, 2);
  await fs.promises.writeFile(config.dataFilePath, jsonData, "utf-8");
};
