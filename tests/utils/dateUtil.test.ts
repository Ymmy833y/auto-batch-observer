import { getCurrentDate, padZero } from '../../src/utils';

const mockDate = (hours: number, minutes: number, seconds: number) => {
  const mockedDate = new Date(2024, 8, 1, hours, minutes, seconds);
  jest.spyOn(global, 'Date').mockImplementation(() => mockedDate);
};

describe('Utils fileUtils Test', () => {
  describe('getCurrentDate', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return the current time in HH:MM:SS format', () => {
      mockDate(9, 5, 3);
      const result = getCurrentDate();
      expect(result).toBe('09:05:03');
    });

    it('should return the current time in HH:MM:SS format with double digits', () => {
      mockDate(23, 59, 59);
      const result = getCurrentDate();
      expect(result).toBe('23:59:59');
    });
  });

  describe('padZero', () => {
    it('should pad single digit numbers with a leading zero', () => {
      expect(padZero(5)).toBe('05');
      expect(padZero(9)).toBe('09');
    });

    it('should not alter numbers with two digits or more', () => {
      expect(padZero(10)).toBe('10');
      expect(padZero(123)).toBe('123');
    });

    it('should pad the target to the specified length', () => {
      expect(padZero(5, 4)).toBe('0005');
      expect(padZero(123, 5)).toBe('00123');
    });
  });
});
