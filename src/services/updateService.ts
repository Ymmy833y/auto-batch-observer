import {
  Observation,
  isObservations,
  ObservationForm,
  Trigger,
} from "../models";
import { readObservationJson, writeObservationJson } from "../utils";

export const updateObservations = async (form: ObservationForm) => {  
  const updateObservation = convertToObservation(form);

  const jsonData = await readObservationJson();
  const observations =
    jsonData && isObservations(jsonData) ? jsonData.observations : [];

  if (observations.length === 0) {
    await writeObservationJson({ observations: [updateObservation] });
    return;
  }

  observations[parseInt(form.index)] = updateObservation;
  await writeObservationJson({ observations });
};

const convertToObservation = (form: ObservationForm): Observation => {
  const triggers = generateTriggers(form.pattern, form.script);
  return {
    name: form.name,
    filePath: form.filePath,
    triggers,
  };
};

const generateTriggers = (
  pattern: string | string[] | undefined,
  script: string | string[] | undefined
): Trigger[] => {
  if (typeof pattern === "string" && typeof script === "string") {
    if (!isTriggerEmpty(pattern, script)) {
      return [generateTrigger(pattern, script)];
    } else {
      return [];
    }
  } else if (typeof pattern === "undefined" || typeof script === "undefined") {
    return [];
  } else if (typeof pattern !== "string" && typeof script !== "string") {
    if (pattern.length === script.length) {
      const validIndexes = pattern
        .map((_, index) => index)
        .filter((index) => !isTriggerEmpty(pattern[index], script[index]));

      if (validIndexes.length === 0) {
        return [];
      }
      return validIndexes.map((index) =>
        generateTrigger(pattern[index], script[index])
      );
    }
  }
  throw new Error("The form input is invalid");
};

const generateTrigger = (pattern: string, script: string): Trigger => ({
  pattern,
  script,
});

const isTriggerEmpty = (pattern: string, script: string): boolean => {
  return pattern === "" && script === "";
};
