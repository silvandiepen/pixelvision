import type { CaptureLabels } from "./labels.model";

/** English labels, the default. */
export const englishLabels: CaptureLabels = {
  faceIntroTitle: "Take a selfie",
  faceIntroBody:
    "We'll ask you to turn your head to each side. Find even light and take off sunglasses or a hat.",
  faceIntroBodyCircle:
    "We'll ask you to move your head in a circle: left, up, right and down. Find even light and take off sunglasses or a hat.",
  faceIntroBodyMotion:
    "Look at the camera for a few seconds. Find even light and take off sunglasses or a hat.",
  faceIntroBodyPlain: "Look at the camera. Find even light and take off sunglasses or a hat.",
  faceIntroBodySteps:
    "We'll ask you to move your head a few times. Find even light and take off sunglasses or a hat.",
  start: "Start camera",
  noFace: "Position your face in the oval",
  tooFar: "Move a little closer",
  tooClose: "Move back a little",
  offCentre: "Centre your face in the oval",
  holdStill: "Hold still",
  faceCamera: "Look straight at the camera",
  turnOneSide: "Slowly turn your head to one side",
  turnOtherSide: "Now turn your head to the other side",
  turnLeft: "Slowly turn your head to your left",
  turnRight: "Now turn your head to your right",
  turnRightFirst: "Slowly turn your head to your right",
  turnLeftNow: "Now turn your head to your left",
  faceCameraAgain: "Look straight at the camera again",
  lookUp: "Slowly tilt your head up",
  lookDown: "Slowly tilt your head down",
  moveNaturally: "Keep looking at the camera, and move your head a little",
  faceDone: "Done. Your photo has been taken",
  timeoutTitle: "That took too long",
  timeoutBody: "Let's try again. Keep your face in the oval and follow each step.",
  stepOf: "Step {step} of {total}",
  faceLost: "Keep your face in the oval",
  severalFaces: "Make sure only you are in the frame",
  alignHelp: "Face the light and keep your whole face in the oval",
  turnFurther: "Turn a bit further, then hold for a moment",
  tiltFurther: "Tilt a bit further, then hold for a moment",
  moveHelp: "Nod or tilt your head slightly, as you would in conversation",
  faceCameraHelp: "Look straight at the screen and keep still",
  faceTooDark: "Find a bit more light",
  faceTooBright: "Too much light. Move out of direct light",
  faceLowContrast: "Wipe the camera lens and find even light",
  faceBlurry: "Hold still for a moment",
  usePrecise: "Use precise detection",
  loadingPrecise: "Loading precise detection",

  docIntroTitle: "Scan your document",
  docIntroBody:
    "Place the document on a dark, plain surface in good light. It is captured once it is held still.",
  docSearching: "Fit the whole document in view",
  docFound: "Document found",
  docHoldStill: "Hold still",
  docReview: "Check that all text is sharp and readable",
  docTooDark: "Find a bit more light",
  docTooBright: "Too much light. Keep the document out of direct light",
  docLowContrast: "Wipe the camera lens and use a dark, plain surface",
  docBlurry: "Hold still so the text is sharp",
  docAdjust: "Drag the corners to the document's edges",
  capture: "Take photo",
  retake: "Retake",
  confirm: "Use this scan",
  adjust: "Adjust corners",
  adjustDone: "Apply corners",
  aspectLabel: "Document shape",
  aspectAuto: "Auto",
  aspectIdCard: "ID card",
  aspectA4: "A4",
  cornerTopLeft: "Top-left corner",
  cornerTopRight: "Top-right corner",
  cornerBottomRight: "Bottom-right corner",
  cornerBottomLeft: "Bottom-left corner",
  cornerHint: "Use the arrow keys to move. Hold Shift to move faster.",

  retry: "Try again",
  startingCamera: "Starting the camera",
  cameraDeniedTitle: "Camera access is off",
  cameraDeniedBody: "Allow camera access for this site in your browser settings, then try again.",
  cameraBlockedFrameTitle: "The camera isn't allowed here",
  cameraBlockedFrameBody:
    'This page is embedded in another page that doesn\'t allow the camera. The embedding page must add allow="camera" to its iframe. You can also open this page on its own.',
  cameraUnavailableTitle: "No camera found",
  cameraUnavailableBody: "Connect a camera, or continue on a phone.",
  cameraInUseTitle: "The camera is in use",
  cameraInUseBody: "Close other apps or tabs that use the camera, then try again.",
  cameraInsecureTitle: "The camera needs a secure connection",
  cameraInsecureBody: "Open this page over https to use the camera.",
  cameraErrorTitle: "The camera didn't start",
  cameraErrorBody: "Try again. If it keeps happening, restart your browser.",

  previewLabel: "Camera preview",
};

/** Dutch labels. */
export const dutchLabels: CaptureLabels = {
  faceIntroTitle: "Maak een selfie",
  faceIntroBody:
    "We vragen je je hoofd naar beide kanten te draaien. Zorg voor gelijkmatig licht en zet een zonnebril of pet af.",
  faceIntroBodyCircle:
    "We vragen je je hoofd in een rondje te bewegen: links, omhoog, rechts en omlaag. Zorg voor gelijkmatig licht en zet een zonnebril of pet af.",
  faceIntroBodyMotion:
    "Kijk een paar seconden in de camera. Zorg voor gelijkmatig licht en zet een zonnebril of pet af.",
  faceIntroBodyPlain:
    "Kijk in de camera. Zorg voor gelijkmatig licht en zet een zonnebril of pet af.",
  faceIntroBodySteps:
    "We vragen je je hoofd een paar keer te bewegen. Zorg voor gelijkmatig licht en zet een zonnebril of pet af.",
  start: "Camera starten",
  noFace: "Plaats je gezicht in het ovaal",
  tooFar: "Kom iets dichterbij",
  tooClose: "Ga iets verder weg",
  offCentre: "Zet je gezicht midden in het ovaal",
  holdStill: "Blijf stil",
  faceCamera: "Kijk recht in de camera",
  turnOneSide: "Draai je hoofd langzaam naar één kant",
  turnOtherSide: "Draai je hoofd nu naar de andere kant",
  turnLeft: "Draai je hoofd langzaam naar links",
  turnRight: "Draai je hoofd nu naar rechts",
  turnRightFirst: "Draai je hoofd langzaam naar rechts",
  turnLeftNow: "Draai je hoofd nu naar links",
  faceCameraAgain: "Kijk weer recht in de camera",
  lookUp: "Kantel je hoofd langzaam omhoog",
  lookDown: "Kantel je hoofd langzaam omlaag",
  moveNaturally: "Blijf in de camera kijken en beweeg je hoofd een beetje",
  faceDone: "Klaar. Je foto is gemaakt",
  timeoutTitle: "Dat duurde te lang",
  timeoutBody: "Probeer het opnieuw. Houd je gezicht in het ovaal en volg elke stap.",
  stepOf: "Stap {step} van {total}",
  faceLost: "Houd je gezicht in het ovaal",
  severalFaces: "Zorg dat alleen jij in beeld bent",
  alignHelp: "Kijk naar het licht en houd je hele gezicht in het ovaal",
  turnFurther: "Draai iets verder en houd dat even vast",
  tiltFurther: "Kantel iets verder en houd dat even vast",
  moveHelp: "Knik of kantel je hoofd een klein beetje, zoals in een gesprek",
  faceCameraHelp: "Kijk recht naar het scherm en blijf stil",
  faceTooDark: "Zoek wat meer licht",
  faceTooBright: "Te veel licht. Ga uit het directe licht",
  faceLowContrast: "Maak de cameralens schoon en zoek gelijkmatig licht",
  faceBlurry: "Blijf even stil",
  usePrecise: "Nauwkeurige detectie gebruiken",
  loadingPrecise: "Nauwkeurige detectie laden",

  docIntroTitle: "Scan je document",
  docIntroBody:
    "Leg het document op een donkere, effen ondergrond in goed licht. Het wordt vastgelegd zodra je het stilhoudt.",
  docSearching: "Zorg dat het hele document in beeld is",
  docFound: "Document gevonden",
  docHoldStill: "Blijf stil",
  docReview: "Controleer of alle tekst scherp en leesbaar is",
  docTooDark: "Zoek wat meer licht",
  docTooBright: "Te veel licht. Houd het document uit direct licht",
  docLowContrast: "Maak de cameralens schoon en gebruik een donkere, effen ondergrond",
  docBlurry: "Houd stil zodat de tekst scherp is",
  docAdjust: "Sleep de hoeken naar de randen van het document",
  capture: "Foto maken",
  retake: "Opnieuw",
  confirm: "Deze scan gebruiken",
  adjust: "Hoeken aanpassen",
  adjustDone: "Hoeken toepassen",
  aspectLabel: "Vorm van het document",
  aspectAuto: "Automatisch",
  aspectIdCard: "ID-kaart",
  aspectA4: "A4",
  cornerTopLeft: "Hoek linksboven",
  cornerTopRight: "Hoek rechtsboven",
  cornerBottomRight: "Hoek rechtsonder",
  cornerBottomLeft: "Hoek linksonder",
  cornerHint: "Verplaats met de pijltjestoetsen. Houd Shift ingedrukt om sneller te gaan.",

  retry: "Opnieuw proberen",
  startingCamera: "Camera wordt gestart",
  cameraDeniedTitle: "Cameratoegang staat uit",
  cameraDeniedBody:
    "Sta cameratoegang voor deze site toe in je browserinstellingen en probeer het opnieuw.",
  cameraBlockedFrameTitle: "De camera is hier niet toegestaan",
  cameraBlockedFrameBody:
    'Deze pagina staat in een andere pagina die de camera niet toestaat. Die pagina moet allow="camera" aan het iframe toevoegen. Je kunt deze pagina ook los openen.',
  cameraUnavailableTitle: "Geen camera gevonden",
  cameraUnavailableBody: "Sluit een camera aan of ga verder op een telefoon.",
  cameraInUseTitle: "De camera is in gebruik",
  cameraInUseBody: "Sluit andere apps of tabbladen die de camera gebruiken en probeer het opnieuw.",
  cameraInsecureTitle: "De camera heeft een beveiligde verbinding nodig",
  cameraInsecureBody: "Open deze pagina via https om de camera te gebruiken.",
  cameraErrorTitle: "De camera is niet gestart",
  cameraErrorBody: "Probeer het opnieuw. Gebeurt het vaker, start dan je browser opnieuw.",

  previewLabel: "Cameravoorbeeld",
};

/** Built-in languages, by primary language subtag. */
export const builtInLabels: Record<string, CaptureLabels> = {
  en: englishLabels,
  nl: dutchLabels,
};

/**
 * Picks the labels for a language and applies overrides. Matches on the
 * primary subtag (`nl-BE` uses `nl`) and falls back to English.
 *
 * @param lang - BCP 47 language tag, e.g. from the element's `lang` attribute.
 * @param overrides - Labels to replace.
 * @returns The complete labels.
 *
 * @example
 * resolveLabels("nl", { start: "Begin" });
 */
export function resolveLabels(
  lang: string | null | undefined,
  overrides: Partial<CaptureLabels> = {},
): CaptureLabels {
  const primary = (lang ?? "").toLowerCase().split("-")[0];
  const base = builtInLabels[primary] ?? englishLabels;
  return { ...base, ...overrides };
}

/**
 * Fills `{name}` placeholders in a label.
 *
 * @param template - Label text with placeholders.
 * @param values - Values by placeholder name; unknown placeholders stay as they are.
 * @returns The filled text.
 *
 * @example
 * formatLabel("Step {step} of {total}", { step: 2, total: 4 }); // "Step 2 of 4"
 */
export function formatLabel(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}
