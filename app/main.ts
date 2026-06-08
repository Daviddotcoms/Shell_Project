import { createInterface } from "readline";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const VALID_COMMANDS: string[] = ["echo", "exit", "type"];

function findExecutable(command: string): string | null {
  const ext = [".exe", ".bat", ".cmd", ""];
  const paths = process.env.PATH?.split(path.delimiter) ?? [];

  for (const dir of paths) {
    for (const extention of ext) {
      const pathExe = path.join(dir, command + extention);
      if (fs.existsSync(pathExe)) {
        return pathExe;
      }
    }
  }
  return null;
}

function replCommand() {
  rl.question("$ ", (answer: string) => {
    let [command, ...args] = answer.trim().split(" ");
    if (answer === "exit 0") {
      rl.close();
      return 0;
    } else if (command === "echo") {
      rl.write(`${args.join(" ")}\n`);
      return replCommand();
    } else if (command === "type") {
      if (VALID_COMMANDS.includes(args[0])) {
        rl.write(`${args[0]} is a shell builtin\n`);
      } else {
        let foundedPath: string = "";
        const pathEnv = findExecutable(args[0]);
        if (pathEnv !== null) {
          foundedPath = pathEnv;
          rl.write(`${args[0]} is ${foundedPath}\n`);
        }
        if (!foundedPath) {
          console.log(`${args[0]}: not found`);
        }
      }
    } else if (findExecutable(command)) {
      execSync(answer, { stdio: "inherit" });
    } else {
      rl.write(`${answer}: not found\n`);
    }
    replCommand();
  });
}

replCommand();
