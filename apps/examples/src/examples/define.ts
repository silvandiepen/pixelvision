import type {
  Control,
  ControlValue,
  ControlValues,
  DemoValue,
  Example,
  ExampleSpec,
  Expectation,
} from "./example.model";
import type { ExpectationResult } from "./define.model";

/**
 * Turns an example as written (its demo typed with its own options) into a
 * registry entry that runs with plain control values. The control values
 * always come from the example's own `controls`, so they match the options
 * the demo declares.
 *
 * @param spec - The example.
 * @typeParam O - The demo's options, matching its controls.
 * @typeParam R - What `resources` loads; the registry passes it back unchanged.
 * @returns The registry entry.
 */
export function defineExample<O, R = undefined>(spec: ExampleSpec<O, R>): Example {
  const { demo, resources, ...info } = spec;
  return {
    ...info,
    ...(resources ? { loadResources: resources } : {}),
    run: (image, options, context) =>
      demo({
        image,
        previous: context?.previous ?? null,
        options: options as O,
        resources: context?.resources as R,
      }),
  };
}

/**
 * Copies a control value, so editing it doesn't change the default.
 *
 * @param value - The value.
 * @returns A deep copy for arrays, the value itself otherwise.
 */
export function copyValue(value: ControlValue): ControlValue {
  if (!Array.isArray(value)) return value;
  return value.map((item) => (Array.isArray(item) ? [...item] : { ...item })) as ControlValue;
}

/**
 * Collects the default value of every control.
 *
 * @param controls - The controls.
 * @returns Values by key.
 */
export function defaultValues(controls: readonly Control[]): ControlValues {
  return Object.fromEntries(controls.map((control) => [control.key, copyValue(control.default)]));
}

/**
 * Checks one expectation against a demo's values.
 *
 * @param expectation - The check.
 * @param values - The demo's `values`.
 * @returns Whether it holds, and the actual value.
 */
export function checkExpectation(
  expectation: Expectation,
  values: Record<string, DemoValue>,
): ExpectationResult {
  const actual = values[expectation.key];
  let pass = actual !== undefined;
  if (expectation.equals !== undefined) pass &&= actual === expectation.equals;
  if (expectation.min !== undefined)
    pass &&= typeof actual === "number" && actual >= expectation.min;
  if (expectation.max !== undefined)
    pass &&= typeof actual === "number" && actual <= expectation.max;
  return { expectation, actual, pass };
}

/**
 * Describes an expectation in words, e.g. `edgePixels between 900 and 1400`.
 *
 * @param expectation - The check.
 * @returns A short description.
 */
export function describeExpectation(expectation: Expectation): string {
  const { key, min, max, equals } = expectation;
  if (equals !== undefined) return `${key} = ${String(equals)}`;
  if (min !== undefined && max !== undefined) {
    return min === max ? `${key} = ${min}` : `${key} between ${min} and ${max}`;
  }
  if (min !== undefined) return `${key} ≥ ${min}`;
  if (max !== undefined) return `${key} ≤ ${max}`;
  return `${key} is present`;
}
