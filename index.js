import fs from "fs";
import { spawn } from "child_process";

const gitInit = (path) => {
  const repoDir = path; // the directory where you want to run `git init`

  // Create the directory if it doesn't exist
  if (!fs.existsSync(repoDir)) {
    fs.mkdirSync(repoDir);
  }

  // Spawn the `git init` command
  const child = spawn("git", ["init"], { cwd: repoDir });

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

const getFilesInCurrentDir = (path) => {
  const files = fs.readdirSync(path);
  console.log(files);
};

// Call the function to run `git init`
//gitInit();
gitStatus("./my-git-repo");
getFilesInCurrentDir("./");
