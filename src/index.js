import express from "express";
import dotenv from "dotenv";
import { getFilesInCurrentDir, getAllDirs } from "./modules/createGitRepo.js";

//환경변수 설정
dotenv.config();
//환경변수
const PORT = process.env.PORT || 3000;

// 로컬 서버 인스턴스
const app = express();

// Routes
app.get("/", (req, res) => {
  getFilesInCurrentDir();
  // const dirs = getAllDirs();
  // console.log(dirs);
  res.send("Pretty Git");
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
