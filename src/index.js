//pacakge import
import express from "express";
import dotenv from "dotenv";
import path from "path";
//class import
//!! import시 주의 사항 : 프로젝트가 module type으로 설정되어있어서
//직접 작성한 모듈이나 클래스를 import하려면, 꼭 .js 확장자를 붙여줘야함.
import Client from "./classes/Client.js";
import History from "./classes/History.js";
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
    user.isRepo = true;
  }

  //레포일 경우 status 업데이트
  if (user.isRepo) {
    user
      .gitStatus(user.path)
      .then((data) => {
        user.updateStatus(data);
      })
      .catch((err) => (user.gitFiles = {}));
  }

  const files = await user.getFilesInCurrentDir();

  res.render("index", {
    title: "Pretty git, Make Your git usage Fancy",
    files: files,
  });
});

app.post("/dirs/forward", (req, res) => {
  const temp = user.path; // 경로 복원용 임시 저장 변수
  user.path = user.path + `${req.body.dirName}/`; // 유저 경로 업데이트
  const newHistory = new History(user.path, user.history.isRepo);

  user
    .getFilesInCurrentDir(newHistory)
    .then(() => {
      user.setHistory(newHistory); // 바뀐 경로로부터 다시 디렉토리 정보 얻어오기

      //재렌더링
      res.redirect("/");
    })
    .catch((err) => {
      user.path = temp; // 디렉터리 이동이 아닐 경우 경로 복원
      res.status(400).send(err.code); // invalid request
    });
});

app.get("/dirs/backward", (req, res) => {
  user.popHistory(); // 이전 히스토리로 이동
  //재렌더링
  if (user.history.prev) {
    user.path = user.history.path; //현재 유저 경로를 이전 디렉토리로 업데이트
    res.redirect("/");
  }
});

app.post("/dirs/git/init", (req, res) => {
  user
    .gitInit(user.path + `${req.body.dirName}/`)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.get("/dirs/git/status", (req, res) => {
  res.send(user.gitFiles);
});

app.post("/dirs/git/add", (req, res) => {
  //untracked -> staged
});

app.post("/dirs/git/restore/:staged", (req, res) => {
  if (req.params.staged == 0) {
    //modified -> unmodified
  } else {
    //staged -> modified or untracked(deleted일때)
  }
});

app.post("/dirs/git/rm/:cached", (req, res) => {
  if (req.params.cached == 0) {
    //committed -> staged(파일도 삭제)
  } else {
    //committed -> untracked
  }
});

app.post("/dirs/git/mv", (req, res) => {
  //rename file
  //commited -> staged
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
