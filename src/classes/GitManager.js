class GitManager {
  constructor(repoPath) {
    this._repoPath = repoPath;
    this._branch = null;
    this._commits = null;
    this._staged = [];
    this._unstaged = []; // ex. {name: "new.txt", status: "modified"}
    this._untracked = [];
  }

  updateStatus(statusLog) {
    const lines = statusLog.toString().split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      console.log(line);

      if (line.startsWith("On branch ")) {
        this._branch = line.substring("On branch ".length).trim();
      } else if (line.startsWith("No commits yet")) {
        this._commits = 0;
      } else if (line.startsWith("Changes to be committed:")) {
        i += 2; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const file = lines[i].split(":")[1].trim();
          this._staged.push(file);
          i++;
        }
        i--; // Go back one line so we don't skip any lines
      } else if (line.startsWith("Changes not staged for commit:")) {
        i += 3; // Skip the next line, which is a header
        while (i < lines.length && lines[i] != "") {
          const file = lines[i].split(":")[1].trim();
          this._unstaged.push(file);
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
    Commit count : ${this._commits}
    Staged items : ${this._staged}
    Unstaged items(being tracked) : ${this._unstaged}
    Untracked items : ${this._untracked}
    `
    );
  }
}

export default GitManager;
