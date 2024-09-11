import { Trigger, isTrigger } from "./trigger";

export interface Observations {
  observations: Observation[];
}

export interface Observation {
  name: string;
  filePath: string;
  triggers: Trigger[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isObservation = (obj: any): boolean => {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === "object" &&
    typeof obj.name === "string" &&
    typeof obj.filePath === "string" &&
    Array.isArray(obj.triggers) &&
    obj.triggers.every(isTrigger)
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isObservations = (obj: any): boolean => {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === "object" &&
    Array.isArray(obj.observations) &&
    obj.observations.every(isObservation)
  );
};
