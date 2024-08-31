export interface ObservationForm {
  index: string;
  name: string;
  filePath: string;
  pattern: string | string[] | undefined;
  script: string | string[] | undefined;
}
