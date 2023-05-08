import fs from "fs";
import path from "path";
import { spawn } from "child_process";

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

export { gitStatus, getFilesInCurrentDir, getAllDirs };
