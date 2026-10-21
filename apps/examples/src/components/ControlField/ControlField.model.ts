import type { Control, ControlValue } from "../../examples/example.model";

export interface ControlFieldProps {
  control: Control;
  modelValue: ControlValue;
}

export interface ControlFieldEmits {
  (event: "update:modelValue", value: ControlValue): void;
}
