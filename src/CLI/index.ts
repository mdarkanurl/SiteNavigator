import { createInterface } from "readline";
import { stdin as input, stdout as output } from 'process';
import { parseInput } from "./parse-input";

const rl = createInterface({
    input,
    output,
    prompt: '> ',
});

rl.prompt();

rl.on('line', async (line) => {
  const result = parseInput(line);

  if (!result.success) {
    console.log(`Error: ${result.error}`);
    rl.prompt();
    return;
  }

  const intent = result.intent;

  console.log("Intent:", intent);

  if (intent.type === "EXIT") {
    rl.close();
    return;
  }
  rl.prompt();
});

rl.on('close', () => {
  console.log('Goodbye!');
  process.exit(0);
});
