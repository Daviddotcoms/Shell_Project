import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});
function replCommand() {
  rl.question("$ ", (answer) => {
    if (answer === "exit 0") {
      rl.close();
      return 0;
    }
    rl.write(`${answer}: command not found\n`);
    replCommand();
  });
}

replCommand();
