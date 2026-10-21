/** One option of a {@link SegmentedChoice}. */
export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedChoiceProps {
  /** What is being chosen, shown above the options. */
  label: string;
  options: SegmentedOption[];
  modelValue: string;
  /** Prefix for each option's `data-choice` attribute, for tests. */
  name: string;
}

export interface SegmentedChoiceEmits {
  (event: "update:modelValue", value: string): void;
}
