import {
  gitAdd,
  gitInit,
  gitMove,
  gitRemove,
  gitRestore,
  gitStatus,
  gitCommit,
  gitBranch,
} from "../modules/gitCommand.js";
//git 명령어를 실행하기 위한 helper library
import { simpleGit } from "simple-git";
import fs from "fs";
import os from "os";

const options = {
  baseDir: process.cwd(),
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: true,
};
const gitHelper = simpleGit(options);

const checkRepo = (req, res, user) => {
  res.send(user.history.isRepo);
};

const checkUntracked = (req, res, user) => {
  res.send(user.history.directoryStatus);
};

const checkStatus = (req, res, user) => {
  res.json({ files: user.gitManager.gitFiles, isRepo: user.gitManager.isRepo });
};

const sendFiles = (req, res, user) => {
  res.send(user.gitManager.gitFiles);
};

const initGitRepository = (req, res, user) => {
  gitInit(user.path + `${req.body.dirName}/`)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};

const addFiles = async (req, res, user) => {
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
};

const commitFiles = async (req, res, user) => {
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
};

const restoreFile = async (req, res, user) => {
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
};

const removeFile = async (req, res, user) => {
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
};

const renameFile = async (req, res, user) => {
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
};

const handleBranchRequest = async (req, res, user) => {
  const { mode, branchName, newName } = req.body;

  switch (mode) {
    case "get":
      res.send(user.gitManager.branch);
      break;

    case "create": {
      try {
        const message = await gitBranch(user.path, branchName);
        res.status(200).json({
          type: "success",
          msg: message,
        });
      } catch (error) {
        console.log("ERROR[create branch] : " + error);
        res.status(400).json({
          type: "error",
          msg: error,
        });
      }
      break;
    }
    case "delete": {
      try {
        await gitHelper.cwd(user.path);
        const commandResponse = await gitHelper.deleteLocalBranch(branchName);
        res.status(200).json({
          type: "success",
          msg: `Successfully deleted branch '${commandResponse}'!`,
        });
      } catch (error) {
        console.log("ERROR[delete branch] : " + error);
        res.status(400).json({
          type: "error",
          msg: "Failed to delete branch" + error,
        });
      }
      break;
    }
    case "rename": {
      try {
        await gitHelper.cwd(user.path);
        const branchResponse = await gitHelper.branchLocal();
        const renameResponse = await gitHelper.branch([
          "-m",
          branchName,
          newName,
        ]);
        if (branchResponse.current == branchName) {
          user.gitManager.branch = newName; //만약 현재 위치한 브랜치의 이름을 바꿨었다면
        }
        res.status(200).json({
          type: "success",
          msg: `Successfully renamed branch '${branchName}' to '${newName}'!`,
        });
      } catch (error) {
        res.status(400).json({
          type: "error",
          msg: "Failed to rename branch" + error,
        });
      }
      break;
    }
    case "checkout": {
      try {
        await gitHelper.cwd(user.path);
        const branchResponse = await gitHelper.branchLocal();
        await gitHelper.checkout(branchName);
        user.gitManager.branch = branchName;
        res.status(200).json({
          type: "success",
          msg: `Successfully checkout the branch from '${branchResponse.current}' to  '${branchName}'`,
        });
      } catch (error) {
        res.status(400).json({
          type: "error",
          msg: `failed to checkout given branch, ${error}`,
        });
      }
      break;
    }
  }
};

const showAllLocalBranches = async (req, res, user) => {
  try {
    gitHelper.cwd(user.path);
    const commandResponse = await gitHelper.branchLocal();
    res.status(200).json({
      type: "success",
      data: commandResponse,
    });
  } catch (error) {
    console.log("ERROR[show branches] : " + error);
    res.status(400).json({
      type: "error",
      msg: error,
    });
  }
};

const handleMergeRequest = async (req, res, user) => {
  try {
    gitHelper.cwd(user.path);
    const { targetBranch } = req.body;
    // const currentBranch = user.gitManager.branch;
    await gitHelper.merge([targetBranch]);
    res.status(200).json({
      type: "success",
      msg: `Successfully merged from '${targetBranch}' to  '${user.gitManager.branch}'`,
    });
  } catch (error) {
    //merge conflict 발생 시
    console.log(error);
    try {
      await gitHelper.reset(["--hard", "ORIG_HEAD"]);
      res.status(400).json({
        type: "error",
        msg: "Failed to Merge, but we aborted it.",
        errorData: error,
      });
    } catch (abortErr) {
      res.status(400).json({
        type: "error",
        msg: "Failed to Merge, and also something gone wrong while aborting merge.",
        errorData: abortErr,
      });
    }
  }
};

// global config에 id, token을 저장하는 함수
const saveUserIdAndTokenToConfig = (userId, token) => {
  const configPath = `${os.homedir()}/.gitconfig`;

  const configData = fs.readFileSync(configPath, "utf8");

  const updatedConfigData =
    configData + `\n\n[github]\n  user = ${userId}\n  token = ${token}\n`;

  fs.writeFileSync(configPath, updatedConfigData, "utf8");
};

const clonePublicRepo = async (req, res, user) => {
  const remoteAddress = req.body.remoteAddress;
  try {
    gitHelper.cwd(user.path);
    await gitHelper.clone(remoteAddress);

    res.status(200).json({
      type: "success",
      msg: `Successfully cloned from '${remoteAddress}'`,
    });
  } catch (error) {
    console.log(`Error[clonePublicRepoAPI]: ${error}`);
    res.status(500).json({
      type: "error",
      msg: `Failed to clone from '${remoteAddress}'`,
      error: error.message,
    });
  }
};

const checkIdPrivateRepo = async (req, res, user) => {
  const remoteAddress = req.body.remoteAddress;
  const urlData = remoteAddress.split("/");
  const IdInUrl = urlData[3];

  try {
    gitHelper.cwd(user.path);
    const configPath = `${os.homedir()}/.gitconfig`;
    const configData = fs.readFileSync(configPath, "utf8");
    const isIdInConfigFile = configData.match(IdInUrl);
    if (isIdInConfigFile) {
      res.status(200).json({
        type: "success",
        msg: "There is a user ID in config file.",
        idInConfigFile: true,
      });
    } else {
      res.status(203).json({
        type: "fail",
        msg: "No user Id in config file.",
        idInConfigFile: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      type: "error",
      msg: "Fail to check id!",
      error: error.message,
    });
  }
};

const clonePrivateUsingConfig = async (req, res, user) => {
  const remoteAddress = req.body.remoteAddress;

  const urlData = remoteAddress.split("/");
  const IdInUrl = urlData[3];
  const repoNameInUrl = urlData[4];

  const configPath = `${os.homedir()}/.gitconfig`;
  const configData = fs.readFileSync(configPath, "utf8");
  
  try {
    gitHelper.cwd(user.path);

    const tokenRegex = /token\s*=\s*(.+)/;
    const tokenMatch = configData.match(tokenRegex);
    const token = tokenMatch && tokenMatch.length >= 2 ? tokenMatch[1] : null;
    const privateRemoteAddress = `https://${token}:x-oauth-basic@github.com/${IdInUrl}/${repoNameInUrl}`;
    await gitHelper.clone(privateRemoteAddress);
    console.log("private clone success");
    res.status(200).json({
      type: "success",
      msg: "Cloning private repo using config flie succeed.",
    });
  } 
  catch (error) {
      console.log(`Error[clonePrivateUsingConfig]: ${error}`);
      res.status(500).json({
        type: "error",
        msg: `Failed to clone using config file, '${remoteAddress}'`,
        error: error.message,
      });
  }
}

const clonePrivateWithoutConfig = async (req, res, user) => {
  const remoteAddress = req.body.remoteAddress;

  const urlData = remoteAddress.split("/");
  const repoNameInUrl = urlData[4];

  try {
    gitHelper.cwd(user.path);

    const newPrivateId = req.body.newPrivateId;
    const newPrivateToken = req.body.newPrivateToken;
    const newPrivateRemoteAddress = `https://${newPrivateToken}:x-oauth-basic@github.com/${newPrivateId}/${repoNameInUrl}`;
    await gitHelper.clone(newPrivateRemoteAddress);
    // config에 새 id, token을 저장.
    saveUserIdAndTokenToConfig(newPrivateId, newPrivateToken);
    console.log("private clone success");
    res.status(200).json({
      type: "success",
      msg: "Cloning private repo with new id and token succeeded.",
    });
  } catch (error) {
    console.log(`Error[clonePrivateRepoAPI]: ${error}`);
    res.status(500).json({
      type: "error",
      msg: `Failed to clone with new id and token. private repo, '${remoteAddress}'`,
      error: error.message,
    });
  }
};

export {
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
  clonePublicRepo,
  checkIdPrivateRepo,
  clonePrivateUsingConfig,
  clonePrivateWithoutConfig,
};
