import chokidar from "chokidar";
import { Observation } from "./observation";

export interface Watcher {
  watcher: chokidar.FSWatcher;
  observation: Observation;
  lastReadPositionMap: Map<string, number>;
}
