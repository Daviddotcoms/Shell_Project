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
    let command = answer.slice(5).trim();
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
        let foundedPath: string = "";
        const paths = process.env.PATH?.split(path.delimiter) ?? [];
        for (const dir of paths) {
          const pathEnv = findExecutable(dir, command);
          if (pathEnv) {
            foundedPath = pathEnv;
            rl.write(`${command} is ${foundedPath}\n`);
          }
        }
        if (!foundedPath) {
          console.log(`${command}: not found`);
        }
      }
    }
    replCommand();
  });
}

replCommand();

function findExecutable(dir: string, command: string): string | null {
  const ext = [".exe", ".bat", ".cmd", ""];
  for (const extention of ext) {
    const pathExe = path.join(dir, command + extention);
    if (fs.existsSync(pathExe)) {
      return pathExe;
    }
  }
  return null;
}
