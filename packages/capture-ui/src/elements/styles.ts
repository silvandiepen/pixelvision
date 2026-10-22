/**
 * Theme tokens and shared styles. Defaults follow the Auno house style on a
 * dark camera view: monochrome ink, signal colours only for success and
 * error, radii control 16 / action 28 / sheet 34, plain `ease` at 150 /
 * 200 / 300 ms. Every token can be overridden on the element.
 */
export const baseStyles = /* css */ `
:host {
  --pv-font: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  --pv-page: #121316;
  --pv-surface: #1c1d20;
  --pv-pressed: #26282a;
  --pv-ink: #f9fafb;
  --pv-secondary: #abacaf;
  --pv-accent: var(--pv-ink);
  --pv-on-accent: var(--pv-page);
  --pv-success: #7fd49a;
  --pv-error: #f2b8b5;
  --pv-overlay: rgb(18 19 22 / 0.64);
  --pv-overlay-blur: 12px;
  --pv-guide-idle: rgb(249 250 251 / 0.5);
  --pv-guide-found: rgb(249 250 251 / 0.85);
  --pv-guide-stroke-width: 3px;
  --pv-ring-width: 6px;
  --pv-ring-gap: 12px;
  --pv-ring-track: rgb(249 250 251 / 0.16);
  --pv-tracker: rgb(249 250 251 / 0.75);
  --pv-landmark: var(--pv-accent);
  --pv-radius: 16px;
  --pv-radius-action: 28px;
  --pv-radius-sheet: 34px;
  --pv-space: 16px;
  --pv-motion-fast: 150ms;
  --pv-motion-duration: 200ms;
  --pv-motion-slow: 300ms;
  --pv-motion-calm: 600ms;
  --pv-accept: var(--pv-success);
  --pv-accept-pulse: 700ms;
  --pv-easing: ease;
  --pv-sheet-shadow: 0 18px 68px rgb(0 0 0 / 0.4);

  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  overflow: hidden;
  contain: content;
  color: var(--pv-ink);
  background: var(--pv-page);
  font-family: var(--pv-font);
  font-size: 1rem;
  line-height: 1.4;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

:host([hidden]) {
  display: none;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

.root {
  position: absolute;
  inset: 0;
}

video,
.still {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: var(--pv-page);
}

.mirrored video,
.mirrored .still {
  transform: scaleX(-1);
}

.stage {
  position: absolute;
  inset: 0;
}

.overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.scrim {
  position: absolute;
  inset: -40px;
  background: var(--pv-overlay);
  -webkit-backdrop-filter: blur(var(--pv-overlay-blur));
  backdrop-filter: blur(var(--pv-overlay-blur));
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  pointer-events: none;
  transition: background-color var(--pv-motion-slow) var(--pv-easing);
}

.instruction {
  position: absolute;
  left: 50%;
  bottom: max(calc(var(--pv-space) * 2), env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: max-content;
  max-width: calc(100% - var(--pv-space) * 2);
  padding: 12px 20px;
  border-radius: var(--pv-radius-action);
  background: rgb(28 29 32 / 0.82);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  color: var(--pv-ink);
  font-size: clamp(1rem, 0.95rem + 0.4vw, 1.25rem);
  font-weight: 600;
  text-align: center;
  display: grid;
  gap: 8px;
  justify-items: center;
  pointer-events: none;
  transition: opacity var(--pv-motion-duration) var(--pv-easing);
}

.instruction:empty,
.instruction[data-empty] {
  opacity: 0;
}

.panel {
  position: absolute;
  inset: auto var(--pv-space) max(var(--pv-space), env(safe-area-inset-bottom));
  margin-inline: auto;
  max-width: 28rem;
  padding: calc(var(--pv-space) * 1.5);
  display: grid;
  gap: var(--pv-space);
  border-radius: var(--pv-radius-sheet);
  background: var(--pv-surface);
  color: var(--pv-ink);
  box-shadow: var(--pv-sheet-shadow);
  user-select: text;
}

.panel[hidden],
[hidden] {
  display: none !important;
}

.panel h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.25;
}

.panel p {
  margin: 0;
  color: var(--pv-secondary);
}

.panel[data-tone="error"] h2::before {
  content: "";
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 10px;
  border-radius: 50%;
  background: var(--pv-error);
  vertical-align: 0.1em;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

button {
  font: inherit;
  font-weight: 600;
  min-height: 48px;
  min-width: 48px;
  padding: 0 22px;
  border: 0;
  border-radius: var(--pv-radius-action);
  background: var(--pv-pressed);
  color: var(--pv-ink);
  cursor: pointer;
  transition:
    background-color var(--pv-motion-fast) var(--pv-easing),
    color var(--pv-motion-fast) var(--pv-easing),
    transform var(--pv-motion-fast) var(--pv-easing);
}

button:hover {
  background: color-mix(in oklab, var(--pv-pressed), var(--pv-ink) 8%);
}

button:active {
  transform: scale(0.98);
}

button.primary {
  background: var(--pv-accent);
  color: var(--pv-on-accent);
}

button.primary:hover {
  background: color-mix(in oklab, var(--pv-accent), var(--pv-page) 10%);
}

button:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid var(--pv-ink);
  outline-offset: 3px;
}

button:disabled {
  opacity: 0.45;
  cursor: default;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.debug {
  position: absolute;
  top: var(--pv-space);
  left: var(--pv-space);
  margin: 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgb(0 0 0 / 0.6);
  color: #fff;
  font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: pre;
  pointer-events: none;
}

.spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid var(--pv-ring-track);
  border-top-color: var(--pv-ink);
}

@media (prefers-reduced-motion: no-preference) {
  .spinner {
    animation: pv-spin 900ms linear infinite;
  }
}

@keyframes pv-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: var(--pv-motion-fast) !important;
    animation: none !important;
  }
}

@media (forced-colors: active) {
  .guide,
  .ring,
  .quad {
    stroke: CanvasText !important;
  }
}
`;

/** Styles for `<pv-face-capture>`. */
export const faceStyles = /* css */ `
.guide {
  fill: none;
  stroke: var(--pv-guide-idle);
  stroke-width: var(--pv-guide-stroke-width);
  transition:
    stroke var(--pv-motion-calm) var(--pv-easing),
    stroke-width var(--pv-motion-calm) var(--pv-easing);
}

.ring-track,
.ring {
  fill: none;
  stroke-width: var(--pv-ring-width);
  stroke-linecap: round;
}

.ring-track {
  stroke: var(--pv-ring-track);
  transition: opacity var(--pv-motion-slow) var(--pv-easing);
}

.ring {
  stroke: var(--pv-accent);
  stroke-dasharray: 100 100;
  stroke-dashoffset: 100;
  /* The fill is eased in script at the display rate; only the colour transitions. */
  transition: stroke var(--pv-motion-calm) var(--pv-easing);
}

[data-tone="found"] .guide {
  stroke: var(--pv-guide-found);
}

[data-tone="aligned"] .guide,
[data-tone="hold"] .guide {
  stroke: var(--pv-accent);
  stroke-width: calc(var(--pv-guide-stroke-width) + 1px);
}

[data-tone="success"] .guide,
[data-tone="success"] .ring {
  stroke: var(--pv-success);
}

[data-tone="error"] .guide,
[data-tone="error"] .ring {
  stroke: var(--pv-error);
}

[data-tone="success"] .scrim {
  background: rgb(18 19 22 / 0.78);
}

.tracker {
  transition: stroke var(--pv-motion-calm) var(--pv-easing);
  fill: none;
  stroke: var(--pv-tracker);
  stroke-width: 2.5px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.landmarks circle {
  fill: var(--pv-landmark);
  stroke: var(--pv-page);
  stroke-width: 1.5px;
}

.hint {
  fill: none;
  stroke: var(--pv-ink);
  stroke-width: 4px;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  transition: opacity var(--pv-motion-slow) var(--pv-easing);
}

.hint[data-show] {
  opacity: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .hint[data-show] .chevrons {
    animation: pv-nudge 1400ms var(--pv-easing) infinite;
  }
  .hint[data-side="right"] .chevrons {
    animation-name: pv-nudge-right;
  }
}

@keyframes pv-nudge {
  0%,
  100% {
    transform: translateX(0);
    opacity: 0.55;
  }
  50% {
    transform: translateX(-10px);
    opacity: 1;
  }
}

@keyframes pv-nudge-right {
  0%,
  100% {
    transform: translateX(0);
    opacity: 0.55;
  }
  50% {
    transform: translateX(10px);
    opacity: 1;
  }
}

.check {
  fill: none;
  stroke: var(--pv-page);
  stroke-width: 5px;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  opacity: 0;
  transition:
    stroke-dashoffset var(--pv-motion-slow) var(--pv-easing) 120ms,
    opacity var(--pv-motion-fast) var(--pv-easing);
}

[data-tone="success"] .check,
[data-accepted] .check {
  stroke-dashoffset: 0;
  opacity: 1;
}

.check-disc {
  fill: var(--pv-success);
  opacity: 0;
  transition: opacity var(--pv-motion-duration) var(--pv-easing);
}

[data-tone="success"] .check-disc,
[data-accepted] .check-disc {
  opacity: 1;
}

/* The acceptance moment: the ring completes and turns the accept colour, the check draws in. */
[data-accepted] .ring,
[data-accepted] .guide {
  stroke: var(--pv-accept);
}

.check-disc {
  fill: var(--pv-accept);
}

@media (prefers-reduced-motion: no-preference) {
  [data-accepted] .ring {
    animation: pv-accept-pulse var(--pv-accept-pulse) var(--pv-easing);
  }
  [data-accepted] .success {
    animation: pv-accept-pop var(--pv-accept-pulse) var(--pv-easing);
  }
}

@keyframes pv-accept-pulse {
  0% {
    stroke-width: var(--pv-ring-width);
  }
  35% {
    stroke-width: calc(var(--pv-ring-width) * 1.8);
  }
  100% {
    stroke-width: var(--pv-ring-width);
  }
}

@keyframes pv-accept-pop {
  0% {
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
}

.steps {
  display: flex;
  gap: 6px;
}

.steps span {
  width: 18px;
  height: 4px;
  border-radius: 999px;
  background: var(--pv-ring-track);
  transition: background-color var(--pv-motion-duration) var(--pv-easing);
}

.steps span[data-done] {
  background: var(--pv-ink);
}

.done-actions {
  position: absolute;
  top: max(var(--pv-space), env(safe-area-inset-top));
  right: var(--pv-space);
}

.shutter {
  position: absolute;
  left: 50%;
  bottom: calc(var(--pv-space) * 6);
  transform: translateX(-50%);
}
.instruction-text {
  transition: opacity var(--pv-motion-duration) var(--pv-easing);
}

.instruction-text[data-swap] {
  opacity: 0;
}

.instruction-hint {
  max-width: 22rem;
  color: var(--pv-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.35;
  opacity: 1;
  transition: opacity var(--pv-motion-slow) var(--pv-easing);
}

.instruction-hint:empty {
  display: none;
}

.instruction-hint[data-swap] {
  opacity: 0;
}

.precise {
  min-height: 36px;
  padding: 0 14px;
  font-size: 0.875rem;
  pointer-events: auto;
  background: rgb(249 250 251 / 0.12);
}

.turn-guide {
  opacity: 0;
  transition: opacity var(--pv-motion-slow) var(--pv-easing);
}

.turn-guide[data-show] {
  opacity: 1;
}

.turn-head {
  fill: rgb(18 19 22 / 0.55);
  stroke: var(--pv-ink);
  stroke-width: 2.5px;
}

.turn-face {
  fill: var(--pv-ink);
}

.turn-face .nose {
  fill: none;
  stroke: var(--pv-ink);
  stroke-width: 2.5px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.turn-arrow {
  fill: none;
  stroke: var(--pv-ink);
  stroke-width: 2.5px;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.8;
}

.turn-guide[data-side="left"] .turn-face {
  transform: translateX(-6px);
}

.turn-guide[data-side="right"] .turn-face {
  transform: translateX(6px);
}

.turn-guide[data-side="up"] .turn-face {
  transform: translateY(-5px);
}

.turn-guide[data-side="down"] .turn-face {
  transform: translateY(5px);
}

.turn-guide:not([data-side="left"]) .turn-arrow[data-dir="left"],
.turn-guide:not([data-side="right"]) .turn-arrow[data-dir="right"],
.turn-guide:not([data-side="up"]) .turn-arrow[data-dir="up"],
.turn-guide:not([data-side="down"]) .turn-arrow[data-dir="down"] {
  display: none;
}

.turn-guide[data-side="either"] .turn-arrow[data-dir="left"],
.turn-guide[data-side="either"] .turn-arrow[data-dir="right"] {
  display: inline;
}

.gauge-track,
.gauge-fill {
  fill: none;
  stroke-width: 4px;
  stroke-linecap: round;
}

.gauge-track {
  stroke: var(--pv-ring-track);
}

.gauge-fill {
  stroke: var(--pv-accent);
}

.gauge[data-reached] .gauge-fill {
  stroke: var(--pv-success);
}

@media (prefers-reduced-motion: no-preference) {
  .turn-guide[data-show][data-side="left"] .turn-face {
    animation: pv-look-left 2400ms var(--pv-easing) infinite;
  }
  .turn-guide[data-show][data-side="right"] .turn-face {
    animation: pv-look-right 2400ms var(--pv-easing) infinite;
  }
  .turn-guide[data-show][data-side="either"] .turn-face {
    animation: pv-look-either 4800ms var(--pv-easing) infinite;
  }
  .turn-guide[data-show][data-side="up"] .turn-face {
    animation: pv-look-up 2400ms var(--pv-easing) infinite;
  }
  .turn-guide[data-show][data-side="down"] .turn-face {
    animation: pv-look-down 2400ms var(--pv-easing) infinite;
  }
}

@keyframes pv-look-left {
  0%,
  15% {
    transform: translateX(0);
  }
  45%,
  80% {
    transform: translateX(-7px);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes pv-look-right {
  0%,
  15% {
    transform: translateX(0);
  }
  45%,
  80% {
    transform: translateX(7px);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes pv-look-up {
  0%,
  15% {
    transform: translateY(0);
  }
  45%,
  80% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes pv-look-down {
  0%,
  15% {
    transform: translateY(0);
  }
  45%,
  80% {
    transform: translateY(6px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes pv-look-either {
  0%,
  8% {
    transform: translateX(0);
  }
  22%,
  38% {
    transform: translateX(-7px);
  }
  50%,
  58% {
    transform: translateX(0);
  }
  72%,
  88% {
    transform: translateX(7px);
  }
  100% {
    transform: translateX(0);
  }
}
`;

/** Styles for `<pv-document-scanner>`. */
export const documentStyles = /* css */ `
:host {
  --pv-document-overlay: rgb(18 19 22 / 0.45);
}

.scrim {
  background: var(--pv-document-overlay);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  opacity: 0;
}

.adjust-text {
  margin: 0;
  padding: 12px 20px;
  border-radius: var(--pv-radius-action);
  background: rgb(28 29 32 / 0.82);
  font-weight: 600;
  text-align: center;
}

.quad {
  fill: rgb(249 250 251 / 0.08);
  stroke: var(--pv-accent);
  stroke-width: var(--pv-guide-stroke-width);
  stroke-linejoin: round;
  transition: stroke var(--pv-motion-duration) var(--pv-easing);
}

[data-phase="ready"] .quad {
  stroke: var(--pv-success);
}

.handle {
  fill: var(--pv-page);
  stroke: var(--pv-accent);
  stroke-width: 3px;
}

[data-phase="ready"] .handle {
  stroke: var(--pv-success);
}

.viewfinder {
  fill: none;
  stroke: var(--pv-guide-idle);
  stroke-width: 3px;
  stroke-linecap: round;
  transition: opacity var(--pv-motion-slow) var(--pv-easing);
}

[data-phase="holding"] .viewfinder,
[data-phase="ready"] .viewfinder {
  opacity: 0;
}

.hold {
  position: absolute;
  top: max(var(--pv-space), env(safe-area-inset-top));
  left: 50%;
  width: 56px;
  height: 56px;
  margin-left: -28px;
  opacity: 0;
  transition: opacity var(--pv-motion-duration) var(--pv-easing);
}

[data-phase="holding"] .hold,
[data-phase="ready"] .hold {
  opacity: 1;
}

.hold circle {
  fill: none;
  stroke-width: 5px;
}

.hold .track {
  stroke: var(--pv-ring-track);
  fill: rgb(18 19 22 / 0.5);
}

.hold .fill {
  stroke: var(--pv-accent);
  stroke-linecap: round;
  stroke-dasharray: 100 100;
  stroke-dashoffset: 100;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset var(--pv-motion-duration) var(--pv-easing);
}

[data-phase="ready"] .hold .fill {
  stroke: var(--pv-success);
}

.shutter {
  position: absolute;
  right: var(--pv-space);
  bottom: max(calc(var(--pv-space) * 2), env(safe-area-inset-bottom));
  width: 64px;
  height: 64px;
  padding: 0;
  border-radius: 50%;
  background: var(--pv-accent);
  box-shadow: 0 0 0 4px var(--pv-page), 0 0 0 7px var(--pv-accent);
}

.review {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: var(--pv-space);
  padding: var(--pv-space);
  padding-bottom: max(var(--pv-space), env(safe-area-inset-bottom));
  background: var(--pv-page);
}

.result-frame {
  position: relative;
  min-height: 0;
  display: grid;
  place-items: center;
}

.result-frame img {
  max-width: 100%;
  max-height: 100%;
  border-radius: var(--pv-radius);
  object-fit: contain;
  background: var(--pv-surface);
}

@media (prefers-reduced-motion: no-preference) {
  .review:not([hidden]) .result-frame img {
    animation: pv-fade-in var(--pv-motion-slow) var(--pv-easing);
  }
}

@keyframes pv-fade-in {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
}

.review-bar {
  display: grid;
  gap: 12px;
  justify-items: center;
}

.review-bar p {
  margin: 0;
  color: var(--pv-secondary);
  text-align: center;
}

.segmented {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: var(--pv-radius-action);
  background: var(--pv-surface);
}

.segmented button {
  min-height: 40px;
  padding: 0 16px;
  background: transparent;
}

.segmented button[aria-checked="true"] {
  background: var(--pv-ink);
  color: var(--pv-page);
}

.adjust {
  position: absolute;
  inset: 0;
  background: var(--pv-page);
  touch-action: none;
}

.adjust .still {
  object-fit: contain;
}

.corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  padding: 0;
  border-radius: 50%;
  background: transparent;
  touch-action: none;
  cursor: grab;
}

.corner::after {
  content: "";
  position: absolute;
  inset: 11px;
  border-radius: 50%;
  background: var(--pv-page);
  box-shadow: 0 0 0 3px var(--pv-accent);
}

.corner:hover,
.corner:active {
  background: rgb(249 250 251 / 0.16);
}

.adjust .overlay .quad {
  fill: rgb(249 250 251 / 0.1);
}

.adjust-bar {
  position: absolute;
  left: var(--pv-space);
  right: var(--pv-space);
  bottom: max(var(--pv-space), env(safe-area-inset-bottom));
  display: grid;
  gap: 12px;
  justify-items: center;
}
`;
