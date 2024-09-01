import { isTrigger } from "../../src/models/trigger";

describe("Models Trigger Tests", () => {
  describe("isTrigger", () => {
    it("should return true for a valid Trigger object", () => {
      const validTrigger = {
        pattern: "test-pattern",
        script: "test-script",
      };

      expect(isTrigger(validTrigger)).toBe(true);
    });

    it("should return false if pattern is not a string", () => {
      const invalidTrigger = {
        pattern: 123, // pattern is not a string
        script: "test-script",
      };

      expect(isTrigger(invalidTrigger)).toBe(false);
    });

    it("should return false if script is not a string", () => {
      const invalidTrigger = {
        pattern: "test-pattern",
        script: 456, // script is not a string
      };

      expect(isTrigger(invalidTrigger)).toBe(false);
    });

    it("should return false if pattern is missing", () => {
      const invalidTrigger = {
        script: "test-script",
      };

      expect(isTrigger(invalidTrigger)).toBe(false);
    });

    it("should return false if script is missing", () => {
      const invalidTrigger = {
        pattern: "test-pattern",
      };

      expect(isTrigger(invalidTrigger)).toBe(false);
    });

    it("should return false if the object is null or undefined", () => {
      expect(isTrigger(null)).toBe(false);
      expect(isTrigger(undefined)).toBe(false);
    });

    it("should return false if the object is not an object", () => {
      expect(isTrigger("not-an-object")).toBe(false);
      expect(isTrigger(123)).toBe(false);
      expect(isTrigger(true)).toBe(false);
    });
  });
});
