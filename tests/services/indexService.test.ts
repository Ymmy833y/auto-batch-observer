import { getObservations } from "../../src/services/indexService";
import { readObservationJson } from "../../src/utils/fileUtil";
import { isObservations } from "../../src/models";

jest.mock("../../src/utils/fileUtil", () => ({
  readObservationJson: jest.fn(),
}));

jest.mock("../../src/models", () => ({
  isObservations: jest.fn(),
}));

describe("Services indexService Test", () => {
  describe("getObservations", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return observations if jsonData is valid", async () => {
      const mockObservations = [
        {
          name: "Test Observation 1",
          filePath: "/path/to/file1",
          triggers: [],
        },
      ];
      const mockJsonData = { observations: mockObservations };

      (readObservationJson as jest.Mock).mockResolvedValue(mockJsonData);
      (
        isObservations as jest.MockedFunction<typeof isObservations>
      ).mockReturnValue(true);

      const result = await getObservations();

      expect(readObservationJson).toHaveBeenCalled();
      expect(isObservations).toHaveBeenCalledWith(mockJsonData);
      expect(result).toEqual(mockObservations);
    });

    it("should return an empty array if jsonData is invalid", async () => {
      const mockJsonData = { someInvalidKey: "invalid data" };

      (readObservationJson as jest.Mock).mockResolvedValue(mockJsonData);
      (
        isObservations as jest.MockedFunction<typeof isObservations>
      ).mockReturnValue(false);

      const result = await getObservations();

      expect(readObservationJson).toHaveBeenCalled();
      expect(isObservations).toHaveBeenCalledWith(mockJsonData);
      expect(result).toEqual([]);
    });

    it("should return an empty array if jsonData is undefined", async () => {
      (readObservationJson as jest.Mock).mockResolvedValue(undefined);

      const result = await getObservations();

      expect(readObservationJson).toHaveBeenCalled();
      expect(isObservations).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
