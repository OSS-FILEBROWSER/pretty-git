import fs from "fs";
import path from "path";
import { spawn } from "child_process";
//class import
import History from "./History.js";

export default class Client {
  constructor() {
    this._path = "/";
    this._history = new History("/");
  }

  getFilesInCurrentDir = () => {
    return new Promise((resolve, reject) => {
      let files = [];
      fs.readdir(this._path, (err, fileList) => {
        if (err) {
          reject(err);
        } else {
          Promise.all(
            fileList.map((file) => {
              return new Promise((resolve, reject) => {
                fs.stat(`${this._path}${file}`, (err, stats) => {
                  //현재 디렉토리에 .git 이 존재하는지 확인
                  const isAlreadyInit = this.isDotGitExists(
                    `${this._path}${file}/.git`
                  );

                  if (err) {
                    files.push({
                      type: "unknown",
                      name: file,
                      initialized: false,
                    });
                  } else {
                    if (stats.isDirectory()) {
                      files.push({
                        type: "directory",
                        name: file,
                        initialized: isAlreadyInit,
                      });
                    } else if (stats.isFile()) {
                      files.push({
                        type: "file",
                        name: file,
                        initialized: false,
                      });
                    } else {
                      files.push({
                        type: "unknown",
                        name: file,
                        initialized: false,
                      });
                    }
                  }
                  resolve();
                });
              });
            })
          )
            .then(() => {
              resolve(files);
            })
            .catch(reject);
        }
      });
    });
  };

  isDotGitExists = (path) => {
    if (fs.existsSync(path) && fs.lstatSync(".git").isDirectory()) {
      const isValid = this.validateDotGit(path);
      return isValid;
    } else {
      return false;
    }
  };

  //유효한 .git 디렉터리인지 확인하는 함수 - 초기 .git 안에 포함되어야하는 모든 디렉터리와 파일을 검사
  validateDotGit = (path) => {
    const dotGitDirList = ["hooks", "objects", "refs", "info"];
    const dotGitFileList = ["HEAD", "description", "config"];

    for (let dir of dotGitDirList) {
      if (
        !fs.existsSync(`${path}/${dir}`) ||
        !fs.lstatSync(`${path}/${dir}`).isDirectory()
      ) {
        return false;
      }
    }

    for (let file of dotGitFileList) {
      if (
        !fs.existsSync(`${path}/${file}`) ||
        !fs.lstatSync(`${path}/${file}`).isFile()
      ) {
        return false;
      }
    }

    return true;
  };

  gitInit = (path) => {
    return new Promise((resolve, reject) => {
      const child = spawn("git", ["init"], { cwd: path });

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

  gitStatus = (path) => {
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

  setHistory = (newHistory) => {
    newHistory.prev = this._history;
    this._history = newHistory; //현재 위치 교체
  };

  popHistory = () => {
    if (this._history.prev) {
      this._history = this._history.prev;
    }
  };

  //data 조작의 오류를 막기 위해 getter, setter 설정.
  get path() {
    return this._path;
  }

  set path(newPath) {
    this._path = newPath;
  }

  get history() {
    return this._history;
  }
}
