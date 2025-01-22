import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function replCommand() {
  rl.question("$ ", (answer) => {
    const secParam = answer.split(" ")[1];
    const validCommands = ["echo", "exit"];
    const commands = answer.split(" ");
    if (answer.includes(`type ${secParam}`)) {
      if (validCommands.includes(secParam)) {
        rl.write(`${secParam} is a shell builtin\n`);
      } else {
        rl.write(`${answer}: command not found\n`);
      }
    } else if (commands[0] === "echo") {
      const slicedWords = commands.slice(1, commands.length);
      rl.write(`${slicedWords.join(" ")}\n`);
    } else if (answer === "exit 0") {
      rl.close();
      return 0;
    } else {
      rl.write(`${answer}: command not found\n`);
    }

    replCommand();
  });
}

replCommand();
