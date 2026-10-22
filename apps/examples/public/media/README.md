# Sample videos

The person in these clips is fictional and AI-generated: not a real individual.

- One frontal photo was generated with OpenAI's image generation through the Codex CLI on
  2026-10-22. Every other pose is an edit of it with only the head pose changed. The same photos,
  scaled down, are the face-neural test fixtures (`packages/face-neural/fixtures/faces`).
- The clips were put together with ffmpeg: each pose held for a moment with a slow zoom and drift,
  and short cross-fades between poses. They are not footage of a real movement.
- `head-turn`: facing the camera, turning to her left, then her right, then back. Passes the
  `head-turn` challenge with HAAR and with YuNet.
- `head-circle`: facing the camera, left, up, right, down, back. Passes `head-circle` with YuNet and
  the head pose tracker.
- `motion`: facing the camera with a gentle sway. Passes `motion` with either detector.

Each clip is an H.264 `.mp4` and a VP9 `.webm`; the page plays whichever the browser supports.
