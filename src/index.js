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
  const files = await user.getFilesInCurrentDir();
  console.log(files);
  res.render("index", {
    title: "Pretty git, Make Your git usage Fancy",
    files: files,
  });
});

app.post("/dirs/forward", (req, res) => {
  const temp = user.path; // 경로 복원용 임시 저장 변수
  user.path = user.path + `${req.body.dirName}/`; // 유저 경로 업데이트

  try {
    user.getFilesInCurrentDir(); // 바뀐 경로로부터 다시 디렉토리 정보 얻어오기
    const newHistory = new History(user.path);
    user.setHistory(newHistory);
    console.log(user.history);
    //재렌더링
    res.redirect("/");
  } catch (err) {
    user.path = temp; // 디렉터리 이동이 아닐 경우 경로 복원
    res.status(400).send(err.code); // invalid request
  }
});

app.get("/dirs/backward", (req, res) => {
  user.popHistory(); // 이전 히스토리로 이동
  //재렌더링
  if (user.history) {
    user.path = user.history.data; //현재 유저 경로를 이전 디렉토리로 업데이트
    res.redirect("/");
  }
});

app.get("/dirs/gitinit", (req, res) => {
  // user.path = user.path + `${req.body.dirName}/`;
  const testpath = `/Users/rocket/workspace/${req.body.dirName}/`;
  user.gitInit(testpath)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});


// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});