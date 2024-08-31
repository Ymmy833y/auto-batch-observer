import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface Config {
  host: string;
  port: number;
  dataDirPath: string;
  logLevel: string;
}

const config: Config = {
  host: process.env.HOST || "localhost",
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  dataDirPath: path.join(__dirname, "../../data/observation.json"),
  logLevel: process.env.LOG_LEVEL || "info",
};

export default config;
