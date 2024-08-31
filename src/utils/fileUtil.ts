import * as fs from "fs";
import * as chardet from "chardet";
import { isObservations, Observations } from "../models";
import config from "../config";

export const checkFileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
}

export const getFileSize = async (file: string): Promise<number> => {
  return fs.promises.stat(file)
    .then(stats => stats.size)
    .catch(error => {
      console.error(`[error] Failed to get file information: ${error}`);
      return 0;
    });
}

export const getFileEncoding = (filePath: string): BufferEncoding => {
  const buffer = fs.readFileSync(filePath, { encoding: null });

  // TODO chardet.detectの戻り値がBufferEncodingではない場合をTryChatchする
  const detectedEncoding = chardet.detect(buffer) as BufferEncoding | null;
  return detectedEncoding ? detectedEncoding : 'utf-8';
}

export const readObservationJson = async (): Promise<Observations | undefined> => {
  const data = await fs.promises.readFile(config.dataDirPath, "utf-8");
  try {
    const parsedData = JSON.parse(data);
    if (isObservations(parsedData)) {
      return parsedData;
    } else {
      console.warn("[warn] Parsed JSON is not in the expected Observations format.");
      return undefined;
    }
  } catch (error) {
    console.error("[error] Error parsing JSON:", String(error));
    return undefined;
  }
};

export const writeObservationJson = async (data: Observations): Promise<void> => {
  const jsonData = JSON.stringify(data, null, 2);
  await fs.promises.writeFile(config.dataDirPath, jsonData, "utf-8");
};
