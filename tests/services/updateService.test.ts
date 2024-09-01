import { readObservationJson, writeObservationJson } from "../../src/utils";
import { ObservationForm } from "../../src/models";
import { updateObservations } from "../../src/services/updateService";

// Mock the utility functions
jest.mock("../../src/utils", () => ({
  readObservationJson: jest.fn(),
  writeObservationJson: jest.fn(),
}));

describe("Services updateService Test", () => {
  describe("updateObservations", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should add a new observation when observations array is empty", async () => {
      const mockForm: ObservationForm = {
        index: "0",
        name: "Test Observation",
        filePath: "/path/to/file",
        pattern: "testPattern",
        script: "testScript",
      };

      (readObservationJson as jest.Mock).mockResolvedValueOnce({
        observations: [],
      });

      await updateObservations(mockForm);

      expect(writeObservationJson).toHaveBeenCalledWith({
        observations: [
          {
            name: "Test Observation",
            filePath: "/path/to/file",
            triggers: [{ pattern: "testPattern", script: "testScript" }],
          },
        ],
      });
    });

    it("should update an existing observation in the array", async () => {
      const mockForm: ObservationForm = {
        index: "0",
        name: "Updated Observation",
        filePath: "/path/to/file",
        pattern: "updatedPattern",
        script: "updatedScript",
      };

      const mockObservations = [
        {
          name: "Old Observation",
          filePath: "/path/to/file",
          triggers: [{ pattern: "oldPattern", script: "oldScript" }],
        },
      ];

      (readObservationJson as jest.Mock).mockResolvedValueOnce({
        observations: mockObservations,
      });

      await updateObservations(mockForm);

      expect(writeObservationJson).toHaveBeenCalledWith({
        observations: [
          {
            name: "Updated Observation",
            filePath: "/path/to/file",
            triggers: [{ pattern: "updatedPattern", script: "updatedScript" }],
          },
        ],
      });
    });

    it("should throw an error if patterns and scripts arrays have different lengths", async () => {
      const mockForm: ObservationForm = {
        index: "0",
        name: "Invalid Observation",
        filePath: "/path/to/file",
        pattern: ["pattern1", "pattern2"],
        script: ["script1"],
      };

      await expect(updateObservations(mockForm)).rejects.toThrow(
        "The form input is invalid"
      );
    });
  });
});
