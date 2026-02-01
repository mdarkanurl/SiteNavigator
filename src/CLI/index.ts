import { createInterface } from "readline";
import { stdin as input, stdout as output } from 'process';

const rl = createInterface({
    input,
    output,
    prompt: '> ',
});

rl.prompt();

rl.on('line', async (line) => {
  const input = line.split(' ');

  switch (input[0]) {
    case 'navigate':
      console.log();
      break;
    case 'time':
      console.log();
      break;
    case 'show':
      console.log();
      break;
    case 'capture':
      console.log();
      break;
    case 'click':
      console.log();
      break;
    case 'help':
      console.log();
      break;
    case 'exit':
      rl.close();
      return;
    default:
      console.log(`You entered: ${input}`);
  }
  rl.prompt();
});

rl.on('close', () => {
  console.log('Goodbye!');
  process.exit(0);
});
