import { Trigger, isTrigger } from "./trigger";

export interface Observations {
  observations: Observation[];
}

export interface Observation {
  name: string;
  filePath: string;
  triggers: Trigger[];
}

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

export const isObservations = (obj: any): boolean => {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === "object" &&
    Array.isArray(obj.observations) &&
    obj.observations.every(isObservation)
  );
};
