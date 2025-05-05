export interface Finding {
  type: string;
  code: string;
  location: {
    line: number;
    column: number;
  };
  file: string;
  severity: "high" | "medium" | "low";
  description: string;
}
