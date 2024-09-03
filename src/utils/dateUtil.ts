export const getCurrentDate = (): string => {
  const d = new Date();
  return `${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}`;
};

export const padZero = (target: any, length: number = 2) => {
  return String(target).padStart(length, "0");
};
