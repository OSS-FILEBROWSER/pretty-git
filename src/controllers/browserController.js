import History from "../classes/History.js";

const forwardHandler = (req, res, user) => {
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
};

const backwardHandler = (_req, res, user) => {
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
};

export { forwardHandler, backwardHandler };
