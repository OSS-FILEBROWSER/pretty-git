import fs from "fs";
import { minimatch } from "minimatch";
//class import
import History from "./History.js";
import File from "./File.js"; // 기존에 객체로 생성하던 파일을, 클래스로 분리
import GitManager from "./GitManager.js";

export default class Client {
  constructor() {
    this._files = [];
    this._path = "/";
    this._history = new History("/", false, "none");
    this._gitManager = new GitManager();
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
              //git status에서 파싱된 파일과 겹치는지 확인
              this._gitManager.gitFiles.forEach((item) => {
                //디렉토리도 이름 체크를 위해, 단순 문자열 비교에서 정규표현식으로 변경
                if (minimatch(item.name, file)) {
                  cur = item;
                }
              });

              //status 업데이트
              let status = "none";
              let statusType = "none";

              if (cur) {
                status = cur.status;
              } else {
                if (this._history.isRepo) {
                  if (this._history.directoryStatus != "none") {
                    status = this._history.directoryStatus;
                  } else {
                    status = "committed";
                  }
                }
              }

              return new Promise((resolve, reject) => {
                fs.stat(`${this._path}${file}`, (err, stats) => {
                  //해당 디렉토리에 .git 이 존재하는지 확인
                  const isAlreadyInit = this.isDotGitExists(
                    `${this._path}${file}/.git`
                  );

                  if (err) {
                    this._files.push(
                      new File("unknown", file, false, status, statusType)
                    );
                  } else {
                    if (stats.isDirectory()) {
                      this._files.push(
                        new File(
                          "directory",
                          file,
                          isAlreadyInit,
                          status,
                          statusType
                        )
                      );
                    } else {
                      this._files.push(
                        new File("file", file, false, status, statusType)
                      );
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

  get files() {
    return this._files;
  }

  get gitManager() {
    return this._gitManager;
  }
}
