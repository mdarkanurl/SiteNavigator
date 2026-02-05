import { createInterface } from "readline";
import { stdin as input, stdout as output } from 'process';
import { parseInput } from "./parse-input";
import { dispatchIntent } from "../state-management/dispatcher";
import { createInitialState } from "../state-management/state";

const rl = createInterface({
    input,
    output,
    prompt: '> ',
});

const state = createInitialState();

rl.prompt();

rl.on('line', async (line) => {
  const parsed = parseInput(line);

  if (!parsed.success) {
    console.log(`Error: ${parsed.error}`);
    rl.prompt();
    return;
  }

  const result = dispatchIntent(parsed.intent, state);

  if (!result.success) {
    console.log(`Error: ${result.error}`);
    rl.prompt();
    return;
  }

  if (result.message) {
    console.log(result.message);
  }

  if (parsed.intent.type === "EXIT") {
    rl.close();
    return;
  }
  rl.prompt();
});

rl.on('close', () => {
  console.log('Goodbye!');
  process.exit(0);
});
