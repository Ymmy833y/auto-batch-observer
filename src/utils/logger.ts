import { createLogger, format, transports, Logger } from "winston";
import config from "../config";

class AppLogger {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: config.logLevel,
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.printf(
          (info) =>
            `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
        )
      ),
      transports: [
        new transports.Console(),
        ...(process.env.NODE_ENV !== "test" ? [new transports.File({ filename: "log/app.log" })] : []),
      ],
    });
  }

  public info(...message: string[]) {
    this.logger.info(message);
  }

  public warn(...message: string[]) {
    this.logger.warn(message);
  }

  public error(...message: (string | Error)[]) {
    this.logger.error(message);
  }

  public log(level: string, ...message: (string | Error)[]) {
    this.logger.log(level, message);
  }
}

export default new AppLogger();