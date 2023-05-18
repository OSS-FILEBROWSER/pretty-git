import { Router } from "express";
import {
  checkRepo,
  checkStatus,
  checkUntracked,
  initGitRepository,
  sendFiles,
  addFiles,
  removeFile,
  restoreFile,
  commitFiles,
  renameFile,
  getBranchInfo,
} from "../controllers/apiController.js";

const router = Router();
// user instance

export function apiRouterWrapper(user) {
  //새로 추가된 api
  router.get("/branch", (req, res) => getBranchInfo(req, res, user));

  router.get("/isRepo", (req, res) => checkRepo(req, res, user));

  router.get("/isTracked", (req, res) => checkUntracked(req, res, user));

  router.get("/status", (req, res) => checkStatus(req, res, user));
  //files에 대한 api 경로 수정
  router.get("/files", (req, res) => sendFiles(req, res, user));

  router.post("/init", (req, res) => initGitRepository(req, res, user));

  router.post("/add", (req, res) => addFiles(req, res, user));

  router.post("/commit", (req, res) => commitFiles(req, res, user));

  router.post("/restore/:staged", (req, res) => restoreFile(req, res, user));

  router.post("/rm/:cached", (req, res) => removeFile(req, res, user));

  router.post("/mv", (req, res) => renameFile(req, res, user));

  return router;
}
