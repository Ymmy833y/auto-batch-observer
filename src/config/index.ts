import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

interface Config {
  host: string;
  port: number;
  dataFilePath: string;
  logLevel: string;
}

const config: Config = {
  host: process.env.HOST || "localhost",
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  dataFilePath: path.join(process.cwd(), 'data/observation.json'),
  logLevel: process.env.LOG_LEVEL || "info",
};

export default config;
