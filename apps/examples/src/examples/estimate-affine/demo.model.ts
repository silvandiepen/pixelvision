import type { EstimationMethod } from "pixelvision";

export interface EstimateAffineDemoOptions {
  outlierShare: number;
  method: EstimationMethod;
  threshold: number;
}
