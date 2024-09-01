import {
  Observations,
  Observation,
  isObservation,
  isObservations,
} from "../../src/models/observation";

describe("Models Observation Tests", () => {
  describe("isObservation", () => {
    it("should return true for a valid Observation object", () => {
      const validObservation: Observation = {
        name: "Test Observation",
        filePath: "/path/to/file",
        triggers: [{ pattern: "test-pattern", script: "test-script" }],
      };

      expect(isObservation(validObservation)).toBe(true);
    });

    it("should return false for an invalid Observation object", () => {
      const invalidObservation = {
        name: 123,
        filePath: "/path/to/file",
        triggers: [{ pattern: "test-pattern", script: "test-script" }],
      };

      expect(isObservation(invalidObservation)).toBe(false);
    });

    it("should return false if triggers is not an array", () => {
      const invalidObservation = {
        name: "Test Observation",
        filePath: "/path/to/file",
        triggers: "not-an-array",
      };

      expect(isObservation(invalidObservation)).toBe(false);
    });

    it("should return false if triggers array contains invalid objects", () => {
      const invalidObservation = {
        name: "Test Observation",
        filePath: "/path/to/file",
        triggers: [{ patterns: "test-pattern", scripts: "test-script" }],
      };

      expect(isObservation(invalidObservation)).toBe(false);
    });
  });

  describe("isObservations", () => {
    it("should return true for a valid Observations object", () => {
      const validObservations: Observations = {
        observations: [
          {
            name: "Test Observation 1",
            filePath: "/path/to/file1",
            triggers: [{ pattern: "test-pattern", script: "test-script" }],
          },
          {
            name: "Test Observation 2",
            filePath: "/path/to/file2",
            triggers: [{ pattern: "test-pattern", script: "test-script" }],
          },
        ],
      };

      expect(isObservations(validObservations)).toBe(true);
    });

    it("should return false for an invalid Observations object", () => {
      const invalidObservations = {
        observations: "not-an-array",
      };

      expect(isObservations(invalidObservations)).toBe(false);
    });

    it("should return false if any observation in observations array is invalid", () => {
      const invalidObservations = {
        observations: [
          {
            name: "Test Observation 1",
            filePath: "/path/to/file1",
            triggers: [{ patterns: "file", scripts: "file1.txt" }],
          },
          {
            name: 123,
            filePath: "/path/to/file2",
            triggers: [{ pattern: "file", scripts: "file2.txt" }],
          },
        ],
      };

      expect(isObservations(invalidObservations)).toBe(false);
    });
  });
});
