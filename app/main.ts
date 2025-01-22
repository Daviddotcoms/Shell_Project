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
    if (answer.includes("echo")) {
      const toPrint = answer.split(" ");
      const slicedWords = toPrint.slice(1, toPrint.length);
      rl.write(`${slicedWords.join(" ")}\n`);
    } else {
      rl.write(`${answer}: command not found\n`);
    }
    replCommand();
  });
}

replCommand();
