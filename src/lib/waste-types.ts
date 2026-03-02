export type WasteCategory = {
  id: string;
  name: string;
  color: string;
};

export type WasteEvent = {
  date: string;
  categories: string[];
};

export type WasteDataset = {
  municipality: string;
  region: string;
  year: number;
  sourceFile: string;
  generatedAt: string;
  parserVersion: string;
  categories: WasteCategory[];
  events: WasteEvent[];
};
