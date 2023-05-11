//pacakge import
import express from "express";
import dotenv from "dotenv";
import path from "path";
//class import
//!! import시 주의 사항 : 프로젝트가 module type으로 설정되어있어서
//직접 작성한 모듈이나 클래스를 import하려면, 꼭 .js 확장자를 붙여줘야함.
import Client from "./classes/Client.js";
import History from "./classes/History.js";
import {
  gitAdd,
  gitInit,
  gitMove,
  gitRemove,
  gitRestore,
  gitStatus,
  gitCommit,
} from "./modules/gitCommand.js";

//환경변수 설정
dotenv.config();
//환경변수
const PORT = process.env.PORT || 3000;
const __DIRNAME = path.resolve();

// 로컬 서버 인스턴스
const app = express();
// 클래스 인스턴스
const user = new Client();

// Global middleware
app.set("views", path.join(__DIRNAME, "src/views")); // view 디렉토리 절대경로 위치 설정
app.set("view engine", "pug"); // 사용할 view engine 설정 , 우리가 사용할 엔진은 pug 엔진
app.use(express.json());
app.use(express.static(path.join(__DIRNAME, "src/public")));

// Routes
app.get("/", async (req, res) => {
  //repository의 하위 디렉토리를 repo안에 있는 것으로 인식하기 위한 조건문
  if (user.isDotGitExists(`${user.path}/.git`)) {
    user.history.isRepo = true;
    user.gitManager.isRepo = true;
    user.gitManager.repoSrc = user.path;
  }

  //레포일 경우 status 업데이트
  if (user.history.isRepo === true) {
    gitStatus(user.path)
      .then((data) => {
        user.gitManager.updateStatus(data);
      })
      .catch((err) => console.log(err));
  }

  const files = await user.getFilesInCurrentDir();
  user.gitManager.checkIgnores(files, user.path);

  res.render("index", {
    title: "Pretty git, Make Your git usage Fancy",
    files: files,
  });
});

app.post("/dirs/forward", (req, res) => {
  const temp = user.path; // 경로 복원용 임시 저장 변수
  const directoryName = req.body.dirName;

  let newDirectoryStat = null;
  user.files.forEach((file) => {
    if (
      file.name == directoryName &&
      (file.status == "untracked" || file.status == "ignored")
    ) {
      newDirectoryStat = file.status;
    }
  });

  user.path = user.path + `${directoryName}/`; // 유저 경로 업데이트
  const newHistory = new History(
    user.path,
    user.history.isRepo, // directory 상태 상속
    newDirectoryStat ? newDirectoryStat : user.history.directoryStatus // directory 상태 상속
  );

  user
    .getFilesInCurrentDir(newHistory)
    .then(() => {
      user.setHistory(newHistory); // 바뀐 경로로부터 다시 디렉토리 정보 얻어오기

      //재렌더링
      res.status(200).redirect("/");
    })
    .catch((err) => {
      user.path = temp; // 디렉터리 이동이 아닐 경우 경로 복원
      res.status(400).send(err.code); // invalid request
    });
});

app.get("/dirs/backward", (req, res) => {
  if (user.history.prev) {
    user.popHistory(); // 이전 히스토리로 이동
    user.path = user.history.path; //현재 유저 경로를 이전 디렉토리로 업데이트
    user.gitManager.ignoreList = [];
    if (!user.history.isRepo) {
      user.gitManager.isRepo = false;
      user.gitManager.repoSrc = "none";
    }
    res.status(200).redirect("/"); //재렌더링
  }
});

app.post("/dirs/git/init", (req, res) => {
  gitInit(user.path + `${req.body.dirName}/`)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.get("/dirs/git/isRepo", (req, res) => {
  res.send(user.history.isRepo);
});

app.get("/dirs/git/status", (req, res) => {
  res.json({ files: user.gitManager.gitFiles, isRepo: user.gitManager.isRepo });
});

app.get("/dirs/files", (req, res) => {
  res.send(user.gitManager.gitFiles);
});

app.post("/dirs/git/add", async (req, res) => {
  const filePath = req.body.filePath;

  try {
    const result = await gitAdd(filePath, user.path);
    try {
      const logData = await gitStatus(user.path);
      user.gitManager.updateStatus(logData);
      res.status(200).send(result);
    } catch (error) {
      console.log(`Error[git status] :  ${error}`);
    }
  } catch (error) {
    console.log(`Error[git add] :  ${error}`);
    res.status(500).send(error);
  }
});

app.post("/dirs/git/commit", async (req, res) => {
  const commitMessage = req.body.commitMessage;

  try {
    const result = await gitCommit(commitMessage, user.path);
    try {
      const logData = await gitStatus(user.path);
      user.gitManager.updateStatus(logData);
      res.status(200).send(result);
    } catch (error) {
      console.log(`Error[git status] :  ${error}`);
    }
  } catch (error) {
    console.log(`Error[git commit] :  ${error}`);
    res.status(500).send(error);
  }
});

app.post("/dirs/git/restore/:staged", async (req, res) => {
  const fileName = req.body.fileName;
  const staged = req.params.staged === "1";

  try {
    const message = await gitRestore(fileName, staged, user.path);
    try {
      const logData = await gitStatus(user.path);
      user.gitManager.updateStatus(logData);
      res.status(200).send(message);
    } catch (error) {
      console.log(`Error[git status] :  ${error}`);
    }
  } catch (error) {
    console.log(`Error[git restore staged] :  ${error}`);
    res.status(500).send(error);
  }
});

app.post("/dirs/git/rm/:cached", async (req, res) => {
  const fileName = req.body.fileName;
  const staged2 = req.params.cached === "1";

  try {
    const message = await gitRemove(fileName, staged2, user.path);
    try {
      const logData = await gitStatus(user.path);
      user.gitManager.updateStatus(logData);
      res.status(200).send(message);
    } catch (error) {
      console.log(`Error[git status] :  ${error}`);
    }
  } catch (error) {
    console.log(`Error[git cached] :  ${error}`);
    res.status(500).send(error);
  }
});

app.post("/dirs/git/mv", async (req, res) => {
  const oldFileName = req.body.oldFileName;
  const newFileName = req.body.newFileName;

  try {
    const message = await gitMove(oldFileName, newFileName, user.path);
    try {
      const logData = await gitStatus(user.path);
      user.gitManager.updateStatus(logData);
      res.status(200).send(message);
    } catch (error) {
      console.log(`Error[git status] :  ${error}`);
    }
  } catch (error) {
    console.log(`Error[git move] :  ${error}`);
    res.status(500).send(error);
  }
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
