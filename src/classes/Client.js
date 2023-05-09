import fs from "fs";
// import path from "path";
import { spawn } from "child_process";
import { minimatch } from "minimatch";
import path, { resolve } from "path";
//class import
import History from "./History.js";

export default class Client {
  constructor() {
    this._branch = undefined;
    this._gitFiles = [];
    this._files = [];
    this._path = "/";
    this._history = new History("/", false);
    this._isRepo = false;
    this._repoSrc = "none";
    this._ignoreList = [];

    if (minimatch("node_modules/", "node_modules/|node_modules/eslint/")) {
      console.log("Path matches ignore pattern.");
    } else {
      console.log("Path does not match ignore pattern.");
    }
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
              let cur = null;
              this._gitFiles.forEach((item) => {
                if (item.name == file) {
                  cur = item;
                }
              });

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
                        status: cur
                          ? cur.status
                          : this._history.isRepo
                          ? "committed"
                          : undefined,
                        statusType: cur ? cur.type : undefined,
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

  gitCommit = (fileName, commitMessage) => {
    return new Promise((resolve, reject) => {
      const args = ["commit", "-m", commitMessage, fileName];

      const child = spawn("git", args, { cwd: this._path });

      child.on("exit", (code, signal) => {
        if (code === 0) {
          const commitMessage = `git commit ${fileName} 성공!`;
          resolve(commitMessage);
        } else {
          const errorMessage = `git commit ${fileName} 실패. code: ${code}, signal: ${signal}`;
          reject(errorMessage);
        }
      });

      child.on("error", (error) => {
        console.log("something wrong");
        reject(`git commit ${fileName} 실행 중 오류 발생: ${error}`);
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

  gitRemove = (fileName, staged) => {
    return new Promise((resolve, reject) => {
      const command = staged ? ["rm", "--cached"] : ["rm"];
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

  gitMove = (oldFileName, newFileName) => {
    return new Promise((resolve, reject) => {
      const args = ["mv", oldFileName, newFileName];

      const child = spawn("git", args, { cwd: this._path });

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
    this._gitFiles = [];
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

          this._gitFiles.push({ name: name, status: "staged", type: type });
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      } else if (line.startsWith("Changes not staged for commit:")) {
        i += 3; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const info = lines[i].split(":");
          const type = info[0].trim();
          const name = info[1].trim();
          this._gitFiles.push({ name: name, status: "modified", type: type });
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      } else if (line.startsWith("Untracked files:")) {
        i += 2; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const file = lines[i].trim();
          this._gitFiles.push({ name: file, status: "untracked", type: null });
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
      try { 
        this._ignoreList = this.parseGitIgnore(`${this._repoSrc}.gitignore`);
      } catch (error) {
        console.log("No gitignore file inside this repo")
      }
    }

    if (this._ignoreList.length != 0) {
      console.log("Starting to find an ignored file..");
      console.log(this.repoSrc);
      for (let ignorePattern of this._ignoreList) {
        for (let file of this._files) {
          let relativePath = path.relative(
            this._repoSrc,
            `${this._path}${file.name}`
          );
          if (file.type == "directory") {
            relativePath = relativePath + "/";
          }
          const matchResult = minimatch(relativePath, ignorePattern);

          if (matchResult == true) {
            file.status = "ignored";
            console.log(`${file.name} - ${file.status}`); // 성공적으로 ignored상태로 바뀌어진 파일들
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

  get repoSrc() {
    return this._repoSrc;
  }

  set repoSrc(val) {
    this._repoSrc = val;
  }

  get ignoreList() {
    return this._ignoreList;
  }

  set ignoreList(val) {
    this._ignoreList = val;
  }
}
