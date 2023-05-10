import fs from "fs";
import { spawn } from "child_process";

const gitInit = (curPath) => {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["init"], { cwd: curPath });

    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve("git init 성공!");
      } else {
        reject(`git init 실패. code: ${code}, signal: ${signal}`);
      }
    });

    child.on("error", (error) => {
      reject(`git init 실행 중 오류 발생: ${error}`);
    });
  });
};

const gitAdd = (fileName, curPath) => {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["add", fileName], { cwd: curPath });

    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve(`git add ${fileName} 성공!`);
      } else {
        reject(`git add ${fileName} 실패. code: ${code}, signal: ${signal}`);
      }
    });

    child.on("error", (error) => {
      reject(`git add ${fileName} 실행 중 오류 발생: ${error}`);
    });
  });
};

const gitRestore = (fileName, staged, curPath) => {
  return new Promise((resolve, reject) => {
    const command = staged ? ["restore", "--staged"] : ["restore"];
    const args = [...command, fileName];

    const child = spawn("git", args, { cwd: curPath });

    child.on("exit", (code, signal) => {
      if (code === 0) {
        const message = `git ${command.join(" ")} ${fileName} 성공!`;
        resolve(message);
      } else {
        const errorMessage = `git ${command.join(
          " "
        )} ${fileName} 실패. code: ${code}, signal: ${signal}`;
        reject(errorMessage);
      }
    });

    child.on("error", (error) => {
      console.log("something wrong");
      reject(`git ${command.join(" ")} 실행 중 오류 발생: ${error}`);
    });
  });
};

const gitRemove = (fileName, staged, curPath) => {
  return new Promise((resolve, reject) => {
    const command = staged ? ["rm", "--cached"] : ["rm"];
    const args = [...command, fileName];

    const child = spawn("git", args, { cwd: curPath });

    child.on("exit", (code, signal) => {
      if (code === 0) {
        const message = `git ${command.join(" ")} ${fileName} 성공!`;
        resolve(message);
      } else {
        const errorMessage = `git ${command.join(
          " "
        )} ${fileName} 실패. code: ${code}, signal: ${signal}`;
        reject(errorMessage);
      }
    });

    child.on("error", (error) => {
      console.log("something wrong");
      reject(`git ${command.join(" ")} 실행 중 오류 발생: ${error}`);
    });
  });
};

const gitMove = (oldFileName, newFileName, curPath) => {
  return new Promise((resolve, reject) => {
    const args = ["mv", oldFileName, newFileName];

    const child = spawn("git", args, { cwd: curPath });

    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve(`git mv ${oldFileName} ${newFileName} 성공!`);
      } else {
        reject(
          `git mv ${oldFileName} ${newFileName} 실패. code: ${code}, signal: ${signal}`
        );
      }
    });

    child.on("error", (error) => {
      console.log("something wrong");
      reject(
        `git mv ${oldFileName} ${newFileName} 실행 중 오류 발생: ${error}`
      );
    });
  });
};

const gitStatus = (path) => {
  const repoDir = path; // the directory where you want to run `git status`

  // Check if the directory exists
  if (!fs.existsSync(repoDir)) {
    return Promise.reject(`Error: ${repoDir} does not exist`);
  }

  return new Promise((resolve, reject) => {
    // Spawn the `git status` command
    const child = spawn("git", ["status"], { cwd: repoDir });

    let stdout = "";
    let stderr = "";

    // Log any output from the command to the console
    child.stdout.on("data", (data) => {
      stdout += data;
    });

    child.stderr.on("data", (data) => {
      stderr += data;
    });

    // Log the exit code when the command has finished running
    child.on("close", (code) => {
      if (code !== 0) {
        reject(`child process exited with code ${code}\n${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

export { gitAdd, gitInit, gitMove, gitRemove, gitRestore, gitStatus };
