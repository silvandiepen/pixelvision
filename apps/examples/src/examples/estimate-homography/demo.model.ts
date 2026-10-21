import type { EstimationMethod } from "pixelvision";

export interface EstimateHomographyDemoOptions {
  outlierShare: number;
  method: EstimationMethod;
  threshold: number;
}
