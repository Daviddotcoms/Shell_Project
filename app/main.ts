import { createInterface } from "readline";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { parse } from "shell-quote";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const VALID_COMMANDS: string[] = ["echo", "exit", "type", "pwd", "cd"];

let currentPath = process.cwd();

// ? THIS FUNCTION JUST CHECKS IF THE FILE EXISTS, BUT IT DOESN'T CHECK IF THE FILE IS EXECUTABLE OR NOT
// function findExecutableType(command: string): string | null {
//   const ext = [".exe", ".bat", ".cmd", ".rpm", ".sh", ".deb", ".tar.gz", ""];
//   const paths = process.env.PATH?.split(path.delimiter) ?? [];

//   for (const dir of paths) {
//     for (const extention of ext) {
//       const pathExe = path.join(dir, command + extention);
//       if (fs.existsSync(pathExe)) {
//         return pathExe;
//       }
//     }
//   }
//   return null;
// }

// ? THIS FUNCTION INCLUDES THE constants.X_OF TO CHECK IF THE FILE IS EXECUTABLE OR NOT
const findExecutable = (command: string) => {
  const folder = process.env.PATH?.split(path.delimiter).find((path) => {
    if (!fs.existsSync(path + "/" + command)) return false;
    if (!(fs.constants.X_OK & fs.statSync(path + "/" + command).mode))
      return false;
    return true;
  });
  return folder ? folder + "/" + command : null;
};

function replCommand() {
  rl.question("$ ", (answer: string) => {
    let input = answer.trim();
    const args = parse(input) as string[];
    const command = args[0];
    if (command === "exit") {
      rl.close();
      const exitStatus = answer.split(" ")[1];
      process.exit(exitStatus ? parseInt(exitStatus) : 0);
    } else if (command === "echo") {
      let echoMessage = args.slice(1).join(" ");
      rl.write(`${echoMessage}\n`);
    } else if (command === "type") {
      if (VALID_COMMANDS.includes(args[1])) {
        rl.write(`${args[1]} is a shell builtin\n`);
      } else {
        const pathEnv = findExecutable(args[1]);
        if (pathEnv !== null) {
          rl.write(`${args[1]} is ${pathEnv}\n`);
        } else {
          console.log(`${args[1]}: not found`);
        }
      }
    } else if (command === "pwd") {
      rl.write(`${currentPath}\n`);
    } else if (command === "cd") {
      const newPath =
        args[1] === "~" ? process.env.HOME : path.resolve(currentPath, args[1]);
      if (newPath) {
        try {
          process.chdir(newPath);
          currentPath = process.cwd();
        } catch (error) {
          rl.write(`${command}: ${args[1]}: No such file or directory\n`);
        }
      }
    } else if (findExecutable(command)) {
      execSync(answer, { stdio: "inherit" });
    } else {
      rl.write(`${answer}: command not found\n`);
    }
    replCommand();
  });
}

replCommand();
