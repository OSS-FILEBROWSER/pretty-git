import { Router } from "express";
import {
  forwardHandler,
  backwardHandler,
} from "../controllers/browserController.js";
const router = Router();
// user instance

export function browseRouterWrapper(user) {
  router.post("/forward", (req, res) => forwardHandler(req, res, user));
  router.get("/backward", (req, res) => backwardHandler(req, res, user));

  return router;
}
