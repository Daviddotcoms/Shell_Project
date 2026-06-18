import { createInterface } from "readline";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { ControlOperator, parse, ParseEntry } from "shell-quote";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const VALID_COMMANDS: string[] = ["echo", "exit", "type", "pwd", "cd"];

let currentPath = process.cwd();

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
    const args = parse(input);
    const command = args[0];
    let rightOperatorPart: ParseEntry = "";

    // EXTRACT ALL THE OPERATOR WITH HIS CORRESPONDING INDEX :)
    let operators = args.reduce<Array<{ index: number; op: string }>>(
      (acc, arg, index) => {
        if (typeof arg === "object" && arg !== null && "op" in arg) {
          acc.push({ index: index, op: arg.op });
        }
        return acc;
      },
      [],
    );

    // SPLIT THE TEXT TO GET THE PART AFTER THE OPERATOR
    if (typeof operators[0] === "object") {
      rightOperatorPart = args[operators[0].index + 1];
      console.log(rightOperatorPart);
    }

    if (command === "exit") {
      rl.close();
      const exitStatus = answer.split(" ")[1];
      process.exit(exitStatus ? parseInt(exitStatus) : 0);
    } else if (command === "echo") {
      let echoMessage = args.slice(1).join(" ");
      rl.write(`${echoMessage}\n`);
    } else if (command === "type") {
      if (VALID_COMMANDS.includes(args[1] as string)) {
        rl.write(`${args[1]} is a shell builtin\n`);
      } else {
        const pathEnv = findExecutable(args[1] as string);
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
        args[1] === "~"
          ? process.env.HOME
          : path.resolve(currentPath, args[1] as string);
      if (newPath) {
        try {
          process.chdir(newPath);
          currentPath = process.cwd();
        } catch (error) {
          rl.write(`${command}: ${args[1]}: No such file or directory\n`);
        }
      }
    } else if (findExecutable(command as string)) {
      execSync(answer, { stdio: "inherit" });
    } else {
      rl.write(`${answer}: command not found\n`);
    }
    replCommand();
  });
}

replCommand();
