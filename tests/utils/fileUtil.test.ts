import * as fs from 'fs';
import path from 'path';
import * as chardet from 'chardet';
import {
  checkFileExists,
  getFileSize,
  getFileEncoding,
  readObservationJson,
  writeObservationJson,
} from '../../src/utils';
import { Observations } from '../../src/models';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  promises: {
    stat: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock('chardet', () => ({
  detect: jest.fn(),
}));

describe('Utils fileUtils Test', () => {
  describe('checkFileExists', () => {
    it('should return true if the file exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const filePath = '/path/to/file';
      const result = checkFileExists(filePath);
      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(filePath);
    });

    it('should return false if the file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const filePath = '/path/to/nonexistent/file';
      const result = checkFileExists(filePath);
      expect(result).toBe(false);
      expect(fs.existsSync).toHaveBeenCalledWith(filePath);
    });
  });

  describe('getFileSize', () => {
    it('should return the file size when the file exists', async () => {
      const mockSize = 1024;
      const mockStat = {
        size: mockSize,
      };
      (fs.promises.stat as jest.Mock).mockResolvedValue(mockStat);

      const filePath = '/path/to/file';
      const result = await getFileSize(filePath);
      expect(result).toBe(mockSize);
      expect(fs.promises.stat).toHaveBeenCalledWith(filePath);
    });

    it('should return 0 and log an error when the file does not exist', async () => {
      const mockError = new Error('File not found');
      (fs.promises.stat as jest.Mock).mockRejectedValue(mockError);

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const filePath = '/path/to/nonexistent/file';
      const result = await getFileSize(filePath);
      expect(result).toBe(0);
      expect(fs.promises.stat).toHaveBeenCalledWith(filePath);

      consoleSpy.mockRestore();
    });
  });

  describe('getFileEncoding', () => {
    it('should return the detected encoding if it is valid', () => {
      const mockBuffer = Buffer.from('some data');
      const mockEncoding = 'utf-8';

      (fs.readFileSync as jest.Mock).mockReturnValue(mockBuffer);
      (chardet.detect as jest.Mock).mockReturnValue(mockEncoding);

      const filePath = '/path/to/file';
      const result = getFileEncoding(filePath);
      expect(result).toBe(mockEncoding);
      expect(fs.readFileSync).toHaveBeenCalledWith(filePath, {
        encoding: null,
      });
      expect(chardet.detect).toHaveBeenCalledWith(mockBuffer);
    });

    it('should throw an error if the detected encoding is not valid', () => {
      const mockBuffer = Buffer.from('some data');
      const mockEncoding = 'invalid-encoding';

      (fs.readFileSync as jest.Mock).mockReturnValue(mockBuffer);
      (chardet.detect as jest.Mock).mockReturnValue(mockEncoding);

      const filePath = '/path/to/file';

      const result = getFileEncoding(filePath);
      expect(result).toBe('utf-8');
    });

    it('should return "utf-8" and log an error if no encoding is detected', () => {
      const mockBuffer = Buffer.from('some data');

      (fs.readFileSync as jest.Mock).mockReturnValue(mockBuffer);
      (chardet.detect as jest.Mock).mockReturnValue(null);

      const filePath = '/path/to/file';

      const result = getFileEncoding(filePath);
      expect(result).toBe('utf-8');
    });
  });

  describe('readObservationJson', () => {
    const mockFilePath = path.join(__dirname, '../../data/observation.json');

    it('should return parsed Observations if the JSON is valid', async () => {
      const mockObservations: Observations = {
        observations: [
          {
            name: 'Test',
            filePath: '/path/to/file',
            triggers: [],
          },
        ],
      };

      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify(mockObservations)
      );

      const result = await readObservationJson();
      expect(result).toEqual(mockObservations);
      expect(fs.promises.readFile).toHaveBeenCalledWith(mockFilePath, 'utf-8');
    });

    it('should return undefined if the JSON is invalid', async () => {
      const invalidJson = '{ name: "Test" }';

      (fs.promises.readFile as jest.Mock).mockResolvedValue(invalidJson);

      const result = await readObservationJson();
      expect(result).toBeUndefined();
    });

    it('should return undefined and log a warning if JSON is valid but not in the expected format', async () => {
      const validButIncorrectJson = JSON.stringify({ foo: 'bar' });

      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        validButIncorrectJson
      );

      const result = await readObservationJson();
      expect(result).toBeUndefined();
    });
  });

  describe('writeObservationJson', () => {
    const mockFilePath = path.join(__dirname, '../../data/observation.json');

    it('should write the JSON data to the file', async () => {
      const mockObservations: Observations = {
        observations: [
          {
            name: 'Test',
            filePath: '/path/to/file',
            triggers: [],
          },
        ],
      };

      const expectedJsonData = JSON.stringify(mockObservations, null, 2);

      await writeObservationJson(mockObservations);

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        mockFilePath,
        expectedJsonData,
        'utf-8'
      );
    });

    it('should handle errors when writing to the file', async () => {
      const mockObservations: Observations = {
        observations: [
          {
            name: 'Test',
            filePath: '/path/to/file',
            triggers: [],
          },
        ],
      };

      const mockError = new Error('Failed to write file');
      (fs.promises.writeFile as jest.Mock).mockRejectedValue(mockError);

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      try {
        await writeObservationJson(mockObservations);
      } catch (error) {
        expect(error).toBe(mockError);
      }

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        mockFilePath,
        JSON.stringify(mockObservations, null, 2),
        'utf-8'
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
