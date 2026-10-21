import type { DemoValue, Expectation } from "./example.model";

/** The outcome of one {@link Expectation}. */
export interface ExpectationResult {
  expectation: Expectation;
  actual: DemoValue | undefined;
  pass: boolean;
}
