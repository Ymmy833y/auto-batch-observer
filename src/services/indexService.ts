import { isObservations, Observation } from '../models';
import { readObservationJson } from '../utils';

export const getObservations = async (): Promise<Observation[]> => {
  const jsonData = await readObservationJson();
  return jsonData && isObservations(jsonData) ? jsonData.observations : [];
};
