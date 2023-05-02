import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import Client from "../classes/Client";

const gitStatus = (path) => {
  const repoDir = path; // the directory where you want to run `git status`

  // Check if the directory exists
  if (!fs.existsSync(repoDir)) {
    console.error(`Error: ${repoDir} does not exist`);
    return;
  }

  // Spawn the `git status` command
  const child = spawn("git", ["status"], { cwd: repoDir });

  // Log any output from the command to the console
  child.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  // Log the exit code when the command has finished running
  child.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

const getFilesInCurrentDir = () => {
  const files = fs.readdirSync("/");
  console.log(files);
};

//default로 root path
const getAllDirs = (dirPath = "/", arrayOfDirs) => {
  const files = fs.readdirSync(dirPath);

  arrayOfDirs = arrayOfDirs || [];

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfDirs.push(fullPath);
      arrayOfDirs = getAllDirs(fullPath, arrayOfDirs);
    }
  });

  return arrayOfDirs;
};

export { gitStatus, gitInit, getFilesInCurrentDir, getAllDirs };
