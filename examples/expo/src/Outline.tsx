import { StyleSheet, View } from "react-native";
import type { OutlineProps } from "./Outline.model";

/**
 * Draws a closed outline through four corners with plain views (one rotated
 * bar per side), so no drawing library or native module is needed.
 *
 * @param props - See {@link OutlineProps}.
 * @returns The outline, positioned over an image of the same scale.
 */
export function Outline({ corners, scale, color = "#3ddc84", thickness = 3 }: OutlineProps) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {corners.map((from, i) => {
        const to = corners[(i + 1) % corners.length];
        const dx = (to.x - from.x) * scale;
        const dy = (to.y - from.y) * scale;
        const length = Math.hypot(dx, dy);
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: from.x * scale + dx / 2 - length / 2,
              top: from.y * scale + dy / 2 - thickness / 2,
              width: length,
              height: thickness,
              backgroundColor: color,
              transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
            }}
          />
        );
      })}
    </View>
  );
}
