import fs from "fs";
import path from "path";
import { minimatch } from "minimatch";

export default class GitManager {
  constructor() {
    this._repoSrc = "none";
    this._gitFiles = [];
    this._ignoreList = [];
    this._isRepo = false;
    this._branch = "none";
  }

  updateStatus(statusLog) {
    this._gitFiles = [];
    const lines = statusLog.toString().split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("On branch ") || line.startsWith("현재 브랜치 ")) {
        this._branch = line.substring("On branch ".length).trim();
      } else if (
        line.startsWith("Changes to be committed:") ||
        line.startsWith("커밋할 변경 사항:")
      ) {
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
      } else if (
        line.startsWith("Changes not staged for commit:") ||
        line.startsWith("커밋하도록 정하지 않은 변경 사항:")
      ) {
        i += 3; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const info = lines[i].split(":");
          const type = info[0].trim();
          const name = info[1].trim();
          this._gitFiles.push({ name: name, status: "modified", type: type });
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      } else if (
        line.startsWith("Untracked files:") ||
        line.startsWith("추적하지 않는 파일:")
      ) {
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

  //.gitignore 파싱
  parseGitIgnore(gitignorePath) {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    const ignorePatterns = gitignoreContent
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.trim().startsWith("#"));
    return ignorePatterns;
  }

  //ignored파일인지 인지 확인  - 정규표현식 매치 라이브러리
  checkIgnores(files, userPath) {
    //현재 위치가 레포이고, ignore list가 아무것도 없으면
    if (this._isRepo && this._ignoreList.length == 0) {
      try {
        //1. gitignore parsing
        this._ignoreList = this.parseGitIgnore(`${this._repoSrc}.gitignore`);
      } catch (error) {
        console.log(error);
      }
    }

    //만약 ignore list가 있으면
    if (this._ignoreList.length != 0) {
      for (let ignorePattern of this._ignoreList) {
        for (let file of files) {
          //레포의 절대경로와 파일의 절대경로로 부터 얻은 파일의 상대경로
          let relativePath = path.relative(
            this._repoSrc, //현재 레포의 절대 경로
            `${userPath}${file.name}` //ignore패턴과 비교하고 싶은 파일의 절대 경로
          );
          if (file.type == "directory") {
            relativePath = relativePath + "/";
          }
          const matchResult = minimatch(relativePath, ignorePattern);

          if (matchResult == true) {
            file.status = "ignored"; //ignored 상태로 변경
          }
        }
      }
    }
  }

  get branch() {
    return this._branch;
  }

  get isRepo() {
    return this._isRepo;
  }

  set isRepo(val) {
    this._isRepo = val;
  }

  get gitFiles() {
    return this._gitFiles;
  }

  set gitFiles(val) {
    this._gitFiles = val;
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
