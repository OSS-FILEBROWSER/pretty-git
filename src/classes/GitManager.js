class GitManager {
  constructor(repoPath) {
    this._repoPath = repoPath;
    this._branch = null;
    this._committed = false;
    this._staged = [];
    this._unstaged = []; // ex. {name: "new.txt", status: "modified"}
    this._untracked = [];
  }

  updateStatus(statusLog, path) {
    this._repoPath = path;
    const lines = statusLog.toString().split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("On branch ")) {
        this._branch = line.substring("On branch ".length).trim();
      } else if (line.startsWith("nothing to commit, working tree clean")) {
        this._committed = true;
      } else if (line.startsWith("No commits yet")) {
        this._committed = false;
      } else if (line.startsWith("Changes to be committed:")) {
        i += 2; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const info = lines[i].split(":");
          const type = info[0].trim();
          const name = info[1].trim();
          this._staged.push({ type: type, name: name });
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      } else if (line.startsWith("Changes not staged for commit:")) {
        i += 3; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const info = lines[i].split(":");
          const type = info[0].trim();
          const name = info[1].trim();
          this._unstaged[name] = type;
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      } else if (line.startsWith("Untracked files:")) {
        i += 2; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const file = lines[i].trim();
          this._untracked.push(file);
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      }
    }
  }

  printAllManagerData() {
    console.log(
      `
현재 repository status

    Repository path : ${this._repoPath}
    Branch : ${this._branch}
    Commit history : ${this._committed}
    Staged items : ${this._staged}
    Unstaged items(being tracked) : ${this._unstaged}
    Untracked items : ${this._untracked}
    `
    );
  }

  get branch() {
    return this._branch;
  }

  get staged() {
    return this._staged;
  }

  get unstaged() {
    return this._unstaged;
  }

  get untracked() {
    return this._untracked;
  }
}

export default GitManager;
