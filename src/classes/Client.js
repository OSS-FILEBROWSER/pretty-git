import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { minimatch } from "minimatch";
//class import
import History from "./History.js";

import { error } from "console";

export default class Client {
  constructor() {
    this._branch = undefined;
    this._gitFiles = {};
    this._files = [];
    this._path = "/";
    this._history = new History("/", false);
    this._isRepo = false;
    this._ignoreList = [];
  }

  getFilesInCurrentDir = (history = null) => {
    this._files = [];

    return new Promise((resolve, reject) => {
      fs.readdir(this._path, (err, fileList) => {
        if (err) {
          reject(err);
        } else {
          Promise.all(
            fileList.map((file) => {
              let cur = this._gitFiles[file];

              return new Promise((resolve, reject) => {
                fs.stat(`${this._path}${file}`, (err, stats) => {
                  //해당 디렉토리에 .git 이 존재하는지 확인
                  const isAlreadyInit = this.isDotGitExists(
                    `${this._path}${file}/.git`
                  );

                  if (err) {
                    this._files.push({
                      type: "unknown",
                      name: file,
                      initialized: false,
                      status: undefined,
                      statusType: undefined,
                    });
                  } else {
                    if (stats.isDirectory()) {
                      this._files.push({
                        type: "directory",
                        name: file,
                        initialized: isAlreadyInit,
                        status: undefined,
                        statusType: undefined,
                      });
                    } else {
                      this._files.push({
                        type: "file",
                        name: file,
                        initialized: false,
                        status: cur
                          ? cur.status
                          : this._history.isRepo
                          ? "committed"
                          : undefined,
                        statusType: cur ? cur.type : undefined,
                      });
                    }
                  }
                  resolve();
                });
              });
            })
          )
            .then(() => {
              resolve(this._files);
            })
            .catch((err) => {
              reject(err);
            });
        }
      });
    });
  };

  /**
   *
   * Git 관련 멤버 함수
   *
   */

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

  gitAdd = (fileName) => {
    return new Promise((resolve, reject) => {
      const child = spawn("git", ["add", fileName], { cwd: this._path });

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

  gitRestore = (fileName, staged) => {
    return new Promise((resolve, reject) => {
      const command = staged ? ["restore", "--staged"] : ["restore"];
      const args = [...command, fileName];

      const child = spawn("git", args, { cwd: this._path });

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
    this._gitFiles = {};
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
          let name = info[1].trim();
          //renamed 상태일때는 화살표 제거
          if (type == "renamed") {
            name = name.split("->")[1].trim();
          }

          this._gitFiles[name] = { status: "staged", type: type };
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      } else if (line.startsWith("Changes not staged for commit:")) {
        i += 3; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const info = lines[i].split(":");
          const type = info[0].trim();
          const name = info[1].trim();
          this._gitFiles[name] = { status: "modified", type: type };
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      } else if (line.startsWith("Untracked files:")) {
        i += 2; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const file = lines[i].trim();
          this._gitFiles[file] = { status: "untracked", type: null };
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      }
    }
  }

  //gitignore파일 파싱
  parseGitIgnore(gitignorePath) {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    const ignorePatterns = gitignoreContent
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.trim().startsWith("#"));

    return ignorePatterns;
  }
  //ignored 인지 확인  - 정규표현식 매치 라이브러리
  checkIgnores(isRepo) {
    if (isRepo && this._ignoreList.length == 0) {
      //1. gitignore parsing
      this._ignoreList = this.parseGitIgnore(`${this._path}/.gitignore`);
      console.log(this._ignoreList);
    }

    if (this._ignoreList.length != 0) {
      console.log("Starting to find an ignored file..");
      for (let ignorePattern of this._ignoreList) {
        for (let file of this._files) {
          const matchResult = minimatch(file, ignorePattern);
          if (matchResult == true) {
            console.log("Found an item matched with ignore pattern");
            file.status = "ignored";
          }
        }
      }
    }
  }

  /**
   *
   * History 관련 멤버 함수
   */
  setHistory = (newHistory) => {
    newHistory.prev = this._history;
    this._history = newHistory; //현재 위치 교체
  };

  popHistory = () => {
    if (this._history.prev) {
      this._history = this._history.prev;
      this._isRepo = this.history.isRepo;
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

  get gitFiles() {
    return this._gitFiles;
  }

  set gitFiles(val) {
    this._gitFiles = val;
  }

  get files() {
    return this._files;
  }

  get branch() {
    return this._branch;
  }
}
