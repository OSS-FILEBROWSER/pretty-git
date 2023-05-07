import fs from "fs";
import path from "path";
import { spawn } from "child_process";
//class import
import History from "./History.js";

export default class Client {
  constructor() {
    this._branch = null;
    this._files = {};
    this._path = "/";
    this._history = new History("/");
    this._isRepo = false;
  }

  getFilesInCurrentDir = () => {
    this._isRepo = this.isDotGitExists(`${this._path}/.git`);

    //레포일 경우 status 업데이트
    if (this._isRepo) {
      this.gitStatus(this._path)
        .then((data) => {
          this.updateStatus(data);
        })
        .catch((err) =>
          console.log("something gone wrong while trying git status")
        );
    }

    return new Promise((resolve, reject) => {
      let files = [];
      fs.readdir(this._path, (err, fileList) => {
        if (err) {
          reject(err);
        } else {
          Promise.all(
            fileList.map((file) => {
              let cur = this._files[file];

              return new Promise((resolve, reject) => {
                fs.stat(`${this._path}${file}`, (err, stats) => {
                  //해당 디렉토리에 .git 이 존재하는지 확인
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
                    } else {
                      files.push({
                        type: "file",
                        name: file,
                        initialized: false,
                        status: cur
                          ? cur.status
                          : this._isRepo
                          ? "committed"
                          : null,
                        statusType: cur ? cur.type : null,
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
            .catch((err) => {
              reject(err);
            });
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

  updateStatus(statusLog) {
    const lines = statusLog.toString().split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("On branch ")) {
        this._branch = line.substring("On branch ".length).trim();
      } else if (line.startsWith("Changes to be committed:")) {
        i += 2; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const info = lines[i].split(":");
          const type = info[0].trim();
          const name = info[1].trim();
          this._files[name] = { status: "staged", type: type };
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      } else if (line.startsWith("Changes not staged for commit:")) {
        i += 3; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const info = lines[i].split(":");
          const type = info[0].trim();
          const name = info[1].trim();
          this._files[name] = { status: "modified", type: type };
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      } else if (line.startsWith("Untracked files:")) {
        i += 2; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const file = lines[i].trim();
          this._files[file] = { status: "untracked", type: null };
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      }
    }
  }

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

  get files() {
    return this._files;
  }

  get branch() {
    return this._branch;
  }
}
