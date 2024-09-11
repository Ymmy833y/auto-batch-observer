export interface Trigger {
  pattern: string;
  script: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isTrigger = (obj: any): obj is Trigger => {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === "object" &&
    typeof obj.pattern === "string" &&
    typeof obj.script === "string"
  );
};
