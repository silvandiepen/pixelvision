import { launchImageLibraryAsync } from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import sample from "../assets/sample.jpg";
import type { Scan } from "./App.model";
import { countEdges, detect, formatCorners } from "./detect";
import { Outline } from "./Outline";
import { bundledImage, readPhoto } from "./pixels";
import type { ImageSource } from "./pixels.model";

/** Whether this JavaScript runs in Hermes, React Native's engine. */
const onHermes = "HermesInternal" in globalThis;

/**
 * Reads an image and finds the document in it.
 *
 * @param source - The image.
 * @returns What was found, with the time detection took.
 */
async function scan(source: ImageSource): Promise<Scan> {
  const { uri, image } = await readPhoto(source);
  const start = performance.now();
  const { edges, corners } = detect(image);
  const milliseconds = performance.now() - start;
  return {
    uri,
    width: image.width,
    height: image.height,
    corners,
    edgeCount: countEdges(edges),
    milliseconds,
  };
}

/**
 * The app: scans the bundled sample on start, and any photo picked from the
 * library after that.
 *
 * @returns The screen.
 */
export default function App() {
  const [result, setResult] = useState<Scan | null>(null);
  const [status, setStatus] = useState("Scanning the sample…");
  const { width: windowWidth } = useWindowDimensions();

  const run = useCallback(async (load: () => Promise<ImageSource | null>) => {
    try {
      const source = await load();
      if (!source) return;
      setStatus("Scanning…");
      const found = await scan(source);
      setResult(found);
      setStatus(found.corners ? "Found a document." : "No document found.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }, []);

  const scanSample = useCallback(() => run(() => bundledImage(sample)), [run]);
  const pickPhoto = useCallback(
    () =>
      run(async () => {
        const picked = await launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
        return picked.canceled ? null : picked.assets[0];
      }),
    [run],
  );

  useEffect(() => {
    void scanSample();
  }, [scanSample]);

  const displayWidth = windowWidth - 32;
  const scale = result ? displayWidth / result.width : 1;

  return (
    <View style={styles.screen}>
      {/* iOS insets the scroll view by the safe area; Android draws edge to edge. */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.content,
          { paddingTop: 16 + (StatusBar.currentHeight ?? 0) },
        ]}
      >
        <Text style={styles.title}>pixelvision</Text>
        <Text style={styles.subtitle}>
          Document detection in React Native · {onHermes ? "Hermes" : "not Hermes"}
        </Text>
        <View style={styles.actions}>
          <Pressable style={styles.button} onPress={scanSample} testID="use-sample">
            <Text style={styles.buttonText}>Use the sample</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={pickPhoto} testID="pick-photo">
            <Text style={styles.buttonText}>Pick a photo</Text>
          </Pressable>
        </View>
        <Text style={styles.status} testID="status">
          {status}
        </Text>
        {result && (
          <>
            <View style={{ width: displayWidth, height: result.height * scale }}>
              <Image
                source={{ uri: result.uri }}
                style={{ width: displayWidth, height: result.height * scale }}
              />
              {result.corners && <Outline corners={result.corners} scale={scale} />}
            </View>
            <Text style={styles.detail} testID="detect-time">
              Detected in {result.milliseconds.toFixed(1)} ms ({result.width} × {result.height},{" "}
              {result.edgeCount} edge pixels)
            </Text>
            <Text style={styles.detail} testID="result-corners">
              {result.corners ? formatCorners(result.corners) : "none"}
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#111418" },
  content: { padding: 16, gap: 12 },
  title: { color: "#ffffff", fontSize: 28, fontWeight: "700" },
  subtitle: { color: "#aab2bd", fontSize: 15 },
  actions: { flexDirection: "row", gap: 12 },
  button: {
    backgroundColor: "#2d6cdf",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: { color: "#ffffff", fontSize: 15, fontWeight: "600" },
  status: { color: "#ffffff", fontSize: 15 },
  detail: { color: "#aab2bd", fontSize: 13, fontVariant: ["tabular-nums"] },
});
