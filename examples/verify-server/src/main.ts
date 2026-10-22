import process from "node:process";
import { createVerifyServer } from "./server.ts";

const secret = process.env.CHALLENGE_SECRET;
if (!secret || secret.length < 32) {
  console.error("Set CHALLENGE_SECRET to a random string of at least 32 characters.");
  process.exit(1);
}
const port = Number(process.env.PORT ?? 8787);
createVerifyServer({ secret }).listen(port, () => {
  console.log(`Challenges at http://localhost:${port}/challenge, evidence to /verify`);
});
