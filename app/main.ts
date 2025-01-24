import { createInterface } from "readline";
import fs from "fs";
import path from "path";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const VALID_COMMANDS: string[] = ["echo", "exit", "type"];

function replCommand() {
  rl.question("$ ", (answer) => {
    let command = answer.slice(5);
    if (answer === "exit 0") {
      rl.close();
      return 0;
    } else if (answer.startsWith("echo")) {
      rl.write(`${command}\n`);
      return replCommand();
    } else if (answer.startsWith("type")) {
      if (VALID_COMMANDS.includes(command)) {
        rl.write(`${command} is a shell builtin\n`);
      } else {
        let found = false;
        const paths = process.env.PATH?.split(":") ?? [];
        paths.forEach((path) => {
          try {
            const cmds = fs.readdirSync(path).filter((cmd) => {
              cmd === command;
            });
            if (cmds.length > 0) {
              found = true;
              cmds.forEach(() => {
                console.log(`${command} is ${path}/${command}`);
              });
            }
          } catch (error: any) {
            // console.log('Error while trying to read the dir of the path: ', error);
          }
        });
        if (!found) {
          console.log(`${command}: not found`);
        }
      }
    }
    replCommand();
  });
}

replCommand();
