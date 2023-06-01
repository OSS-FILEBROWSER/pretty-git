//pacakge import
import express from "express";
import path from "path";
//class import
//!! import시 주의 사항 : 프로젝트가 module type으로 설정되어있어서
//직접 작성한 모듈이나 클래스를 import하려면, 꼭 .js 확장자를 붙여줘야함.
import Client from "./classes/Client.js";
import { gitStatus } from "./modules/gitCommand.js";
import { apiRouterWrapper } from "./router/api.js";
import { browseRouterWrapper } from "./router/browser.js";
//Constant
const PORT = 3000;
const __DIRNAME = path.resolve();

// 로컬 서버 인스턴스
const app = express();
// 클래스 인스턴스
const user = new Client();
const apiRouter = apiRouterWrapper(user);
const browseRouter = browseRouterWrapper(user);

// Global middleware
app.set("views", path.join(__DIRNAME, "src/views")); // view 디렉토리 절대경로 위치 설정
app.set("view engine", "pug"); // 사용할 view engine 설정 , 우리가 사용할 엔진은 pug 엔진
app.use(express.json());
app.use(express.static(path.join(__DIRNAME, "src/public")));
app.use("/dirs", browseRouter);
app.use("/dirs/git", apiRouter);

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
    try {
      const logData = await gitStatus(user.path);
      ㅇ;
      user.gitManager.updateStatus(logData);
    } catch (error) {
      console.log(error);
    }
  }

  const files = await user.getFilesInCurrentDir();
  user.gitManager.checkIgnores(files, user.path);

  res.render("index", {
    title: "Pretty git, Make Your git usage Fancy",
    files: files,
  });
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
