export const getCurrentDate = (): string => {
  const d = new Date();
  return `${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const padZero = (target: any, length: number = 2) => {
  return String(target).padStart(length, "0");
};
