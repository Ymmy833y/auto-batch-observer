import { Request, Response } from "express";
import { index, update, notFound } from "../../src/controllers";
import { getObservations } from "../../src/services/indexService";
import { updateObservations } from "../../src/services/updateService";
import { restartObservation } from "../../src/services/observationService";

jest.mock("../../src/services/indexService");
jest.mock("../../src/services/updateService");
jest.mock("../../src/services/observationService");

describe("Controllers index Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockRender: jest.Mock;
  let mockRedirect: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockRender = jest.fn();
    mockRedirect = jest.fn();
    mockStatus = jest.fn().mockReturnThis();

    req = {
      body: {},
    };
    res = {
      render: mockRender,
      redirect: mockRedirect,
      status: mockStatus,
      send: jest.fn(),
    };
  });

  describe("index", () => {
    it("should render the index view with observations", async () => {
      const mockObservations = [{ id: 1, name: "Observation 1" }];
      (getObservations as jest.Mock).mockResolvedValue(mockObservations);

      await index(req as Request, res as Response);

      expect(getObservations).toHaveBeenCalled();
      expect(mockRender).toHaveBeenCalledWith("index", {
        observations: mockObservations,
      });
    });
  });

  describe("update", () => {
    it("should update observations and restart the observation service, then redirect to '/'", async () => {
      req.body = {
        index: 1,
        name: "Test Name",
        filePath: "/path/to/file",
        pattern: "test-pattern",
        script: "test-script",
      };

      await update(req as Request, res as Response);

      expect(updateObservations).toHaveBeenCalledWith({
        index: 1,
        name: "Test Name",
        filePath: "/path/to/file",
        pattern: "test-pattern",
        script: "test-script",
      });
      expect(restartObservation).toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith("/");
    });

    it("should return a 500 status code when an error occurs", async () => {
      const mockError = new Error("Test Error");
      (updateObservations as jest.Mock).mockRejectedValue(mockError);

      await update(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        "An error occurred while updating observations."
      );
    });
  });

  describe("notFound", () => {
    it("should return a 404 status code with 'Not found' message", () => {
      notFound(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Not found");
    });
  });
});
