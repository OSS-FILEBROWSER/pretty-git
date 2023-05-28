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
  handleBranchRequest,
  showAllLocalBranches,
  handleMergeRequest,
  handleCloneRequest,
  renderGraphPage,
  sendCommitHistory,
  sendCommitDetail,
} from "../controllers/apiController.js";

const router = Router();
// user instance

export function apiRouterWrapper(user) {
  //새로 추가된 api
  router.post("/branch", (req, res) => handleBranchRequest(req, res, user));
  router.get("/branches", (req, res) => showAllLocalBranches(req, res, user));

  router.post("/merge", (req, res) => handleMergeRequest(req, res, user));

  router.post("/clone", (req, res) => handleCloneRequest(req, res, user));
  router.get("/log", (req, res) => renderGraphPage(req, res, user));
  router.post("/logData", (req, res) => sendCommitHistory(req, res, user));
  router.post("/commitDetail", (req, res) => sendCommitDetail(req, res, user));

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
