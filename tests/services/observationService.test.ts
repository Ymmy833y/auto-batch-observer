import {
  watchers,
  beginFileObservation,
  finishFileObservation,
} from "../../src/services/observationService";
import { Watcher, isObservations } from "../../src/models";
import { readObservationJson, checkFileExists } from "../../src/utils";
import chokidar from "chokidar";

jest.mock("../../src/services/observationService", () => ({
  ...jest.requireActual("../../src/services/observationService"),
}));

jest.mock("../../src/utils", () => ({
  readObservationJson: jest.fn(),
  checkFileExists: jest.fn(),
  getFileSize: jest.fn(),
  getFileEncoding: jest.fn(),
}));

jest.mock("../../src/models", () => ({
  isObservations: jest.fn(),
}));

jest.mock("chokidar", () => ({
  watch: jest.fn(() => ({
    on: jest.fn(),
    close: jest.fn(),
  })),
}));

jest.mock("fs", () => ({
  createReadStream: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
  })),
}));

describe("Services observationService Test", () => {
  describe("beginFileObservation", () => {
    afterEach(() => {
      jest.clearAllMocks();
      watchers.length = 0;
    });

    it("should log a warning if readObservationJson fails", async () => {
      (readObservationJson as jest.Mock).mockResolvedValue(null);

      console.warn = jest.fn();

      await beginFileObservation();

      expect(readObservationJson).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        "[warn] Failed to load observations data."
      );
      expect(watchers.length).toBe(0);
    });

    it("should log a warning if no observations are set", async () => {
      (readObservationJson as jest.Mock).mockResolvedValue({
        observations: [],
      });
      (isObservations as jest.Mock).mockReturnValue(false);

      console.warn = jest.fn();

      await beginFileObservation();

      expect(isObservations).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        "[warn] No files to be observed have been set."
      );
      expect(watchers.length).toBe(0);
    });

    it("should call initializeListeners for each valid observation and add to watchers", async () => {
      const observation = {
        filePath: "/some/path",
        triggers: [{ pattern: "trigger", script: "script.sh" }],
      };
      (readObservationJson as jest.Mock).mockResolvedValue({
        observations: [observation],
      });
      (isObservations as jest.Mock).mockReturnValue(true);
      (checkFileExists as jest.Mock).mockReturnValue(true);

      await beginFileObservation();

      expect(isObservations).toHaveBeenCalled();
      expect(checkFileExists).toHaveBeenCalledWith(observation.filePath);
      expect(chokidar.watch).toHaveBeenCalledWith(
        observation.filePath,
        expect.any(Object)
      );
      expect(watchers.length).toBe(1);
    });

    it("should log a warning if a file does not exist", async () => {
      const observation = {
        filePath: "/invalid/path",
        triggers: [],
      };
      (readObservationJson as jest.Mock).mockResolvedValue({
        observations: [observation],
      });
      (isObservations as jest.Mock).mockReturnValue(true);
      (checkFileExists as jest.Mock).mockReturnValue(false);

      console.warn = jest.fn();

      await beginFileObservation();

      expect(checkFileExists).toHaveBeenCalledWith(observation.filePath);
      expect(console.warn).toHaveBeenCalledWith(
        "File does not exist: /invalid/path"
      );
      expect(watchers.length).toBe(0);
    });

    it("should set up file watchers correctly for valid files and add them to watchers", async () => {
      const observation = {
        filePath: "/valid/path",
        triggers: [{ pattern: "trigger", script: "script.sh" }],
      };
      (readObservationJson as jest.Mock).mockResolvedValue({
        observations: [observation],
      });
      (isObservations as jest.Mock).mockReturnValue(true);
      (checkFileExists as jest.Mock).mockReturnValue(true);

      await beginFileObservation();

      expect(chokidar.watch).toHaveBeenCalledWith(
        observation.filePath,
        expect.any(Object)
      );
      expect(watchers.length).toBe(1);
      expect(watchers[0].observation).toEqual(observation);
    });
  });

  describe("finishFileObservation", () => {
    let mockWatcher1: Watcher;

    beforeEach(() => {
      mockWatcher1 = {
        watcher: chokidar.watch("/path/to/file1"),
        observation: {
          name: "test1",
          filePath: "/path/to/file1",
          triggers: [],
        },
        lastReadPositionMap: new Map(),
      };
      watchers.length = 0;
      watchers.push(mockWatcher1);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should call close on all watchers and reset the watchers array", async () => {
      await finishFileObservation();

      expect(mockWatcher1.watcher.close).toHaveBeenCalled();

      expect(watchers).toEqual([]);
    });
  });
});
