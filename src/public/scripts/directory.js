const rootElement = document.querySelector("#root");
const directories = document.querySelectorAll(".directory-item");
const backButton = document.querySelector("#back");
const gitStatusModal = document.querySelector(".git-status-modal");
const openModalButton = document.querySelector(".open-modal");
const branchButton = document.querySelector(".branch-button");
const cloneButton = document.querySelector(".clone-button");
const closeModalButton = document.querySelector(".close-modal");
const untrackedList = document.querySelector(".status-item.untracked ul");
const modifiedList = document.querySelector(".status-item.modified ul");
const stagedList = document.querySelector(".status-item.staged ul");
const logButton = document.querySelector(".log-button");
// const committedList = document.querySelector(".status-item.committed ul");
let untracked = [];
let modified = [];
let staged = [];
let committed = [];

directories.forEach(async (dir) => {
  const imageContainer = dir.querySelector(".file-image-container");
  const imageSrc = imageContainer.querySelector("img").src;
  const statusString = imageSrc.split("/")[4].split(".")[0];

  dir.addEventListener("dblclick", () => {
    const directoryName = dir.childNodes[2].innerHTML; // 현재 디렉토리 이름

    //서버로 request 보내는 방법 - axios 사용
    axios
      .post("/dirs/forward", { dirName: directoryName })
      .then((res) => {
        window.location.href = "/";
      })
      .catch((err) => {
        switch (err.response.data) {
          case "ENOENT":
            alert("No such file or directory");
            break;
          case "EPERM":
            alert("No permission to access this directory");
            break;
          case "ENOTDIR":
            alert("It is not directory");
            break;
        }
      });
  });

  //특정 상태에 대해서는 context menu를 띄우지 않음
  const isTracked = await axios.get("/dirs/git/isTracked");
  if (
    statusString != "ignored" &&
    statusString != "documents" &&
    statusString != "git" &&
    isTracked.data != "untracked"
  ) {
    dir.addEventListener("contextmenu", (event) => {
      console.log(dir);
      // 기본 Context Menu가 나오지 않게 차단
      event.preventDefault();

      const directoryName = dir.childNodes[2].innerHTML;
      const ctxMenu = document.createElement("div");

      ctxMenu.id = "context-menu";
      ctxMenu.className = "custom-context-menu";

      //위치 설정
      ctxMenu.style.top = event.pageY + "px";
      ctxMenu.style.left = event.pageX + "px";

      if (statusString === "untracked") {
        //untracked
        ctxMenu.appendChild(
          renderContextMenuList([
            {
              label: "git add",
              onClick: async () => {
                try {
                  const response = await axios.post("/dirs/git/add", {
                    filePath: directoryName,
                  });
                  window.location.href = "/";
                } catch (error) {
                  console.log(error);
                  alert("something gone wrong while processing git add");
                }
              },
            },
          ])
        );
      } else if (statusString === "modified") {
        //modified
        ctxMenu.appendChild(
          renderContextMenuList([
            {
              label: "git add",
              onClick: async () => {
                try {
                  const response = await axios.post("/dirs/git/add", {
                    filePath: directoryName,
                  });
                  window.location.href = "/";
                } catch (error) {
                  console.log(error);
                  alert("something gone wrong while processing git init");
                }
              },
            },
            {
              label: "git restore",
              onClick: async () => {
                try {
                  const response = await axios.post("/dirs/git/restore/0", {
                    fileName: directoryName,
                  });
                  window.location.href = "/";
                } catch (error) {
                  console.log(error);
                  alert("something gone wrong while processing git restore");
                }
              },
            },
          ])
        );
      } else if (statusString === "staged") {
        //staged
        ctxMenu.appendChild(
          renderContextMenuList([
            {
              label: "git restore --staged",
              onClick: async () => {
                try {
                  const response = await axios.post("/dirs/git/restore/1", {
                    fileName: directoryName,
                  });
                  window.location.href = "/";
                } catch (error) {
                  console.log(error);
                  alert(
                    "something gone wrong while processing git restore --staged"
                  );
                }
              },
            },
          ])
        );
      } else if (statusString === "committed") {
        //committed
        const dirIconSrc = imageContainer.childNodes[1].src;
        const dirType = dirIconSrc.split("/")[4].split(".")[0];

        if (dirType == "documents") {
          ctxMenu.appendChild(
            renderContextMenuList([
              {
                label: "git rm",
                onClick: async () => {
                  try {
                    const res = await axios.post("/dirs/git/rm/0", {
                      fileName: directoryName,
                    });
                    console.log(res.data);
                    window.location.href = "/";
                  } catch (error) {
                    console.log(error);
                    alert("something gone wrong while processing git rm");
                  }
                },
              },
              {
                label: "git rm --cached",
                onClick: async () => {
                  try {
                    const res = await axios.post("/dirs/git/rm/1", {
                      fileName: directoryName,
                    });
                    window.location.href = "/";
                  } catch (error) {
                    console.log(error);
                    alert(
                      "something gone wrong while processing git rm --cached"
                    );
                  }
                },
              },
              {
                label: "git mv",
                onClick: async () => {
                  try {
                    const input = prompt("Type new file name");
                    const currentName = dir.querySelector(".directory-name");
                    const response = await axios.post("/dirs/git/mv", {
                      oldFileName: directoryName,
                      newFileName: input,
                    });

                    window.location.href = "/";
                    currentName.textContent = input;
                  } catch (error) {
                    console.log(error);
                    alert("something gone wrong while processing git mv");
                  }
                },
              },
            ])
          );
        } else {
          ctxMenu.appendChild(
            renderContextMenuList([
              {
                label: "git mv",
                onClick: async () => {
                  try {
                    const input = prompt("Type new file name");
                    const currentName = dir.querySelector(".directory-name");
                    const response = await axios.post("/dirs/git/mv", {
                      oldFileName: directoryName,
                      newFileName: input,
                    });

                    window.location.href = "/";
                    currentName.textContent = input;
                  } catch (error) {
                    console.log(error);
                    alert("something gone wrong while processing git mv");
                  }
                },
              },
            ])
          );
        }
      } else if (statusString == "folder") {
        ctxMenu.appendChild(
          renderContextMenuList([
            {
              label: "git init",
              onClick: async () => {
                try {
                  axios
                    .post("/dirs/git/init", {
                      dirName: directoryName,
                    })
                    .then((res) => {
                      if (res.status == 200) {
                        window.location.reload();
                      }
                    });
                } catch (error) {
                  console.log(error);
                  alert("something gone wrong while processing git init");
                }
              },
            },
          ])
        );
      }

      // 이전 Element 삭제
      const prevCtxMenu = document.getElementById("context-menu");
      if (prevCtxMenu) {
        prevCtxMenu.remove();
      }

      // Body에 Context Menu를 추가.
      document.body.appendChild(ctxMenu);
    });
  }
});

backButton.addEventListener("click", () => {
  try {
    axios.get("/dirs/backward").then((res) => {
      if (res.status == 200) {
        window.location.reload();
      }
    });
  } catch (error) {
    console.log(`Error[go back] : ${error}`);
  }
});

// commit event
async function requestCommit() {
  const commitText = prompt("commit message 입력");
  if (commitText !== null) {
    try {
      const response = await axios.post("/dirs/git/commit", {
        commitMessage: commitText,
      });
      if (response.status == 200) {
        alert("All Staged files successfully committed!!");
      }
      window.location.reload();
    } catch (error) {
      console.log(error);
      alert("Something gone wrong while processing git commit");
    }
  } else {
    alert("You should type message to commit");
  }
}

// context menu 없애기
function handleClearContextMenu(event) {
  const ctxMenu = document.getElementById("context-menu");
  if (ctxMenu) {
    ctxMenu.remove();
  }
}

function renderContextMenuList(list) {
  // List Element 생성
  const ctxMenuList = document.createElement("ul");
  ctxMenuList.className = "custom-context-menu-ul";
  // List Item 생성
  list.forEach(function (item) {
    // Item Element 생성
    const ctxMenuItem = document.createElement("li");
    const ctxMenuItemAnchor = document.createElement("a");
    const ctxMenuItemAnchorText = document.createTextNode(item.label);

    ctxMenuItem.className = "custom-context-menu-li";

    if (item.submenu) {
      const arrowIcon = document.createElement("span");
      arrowIcon.className = "submenu-arrow";
      ctxMenuItemAnchor.appendChild(arrowIcon);

      const submenu = renderContextMenuList(item.submenu);
      submenu.className = "submenu-container";
      ctxMenuItem.appendChild(submenu);

      ctxMenuItem.addEventListener("mouseenter", () => {
        submenu.style.display = "block";
      });

      ctxMenuItem.addEventListener("mouseleave", () => {
        submenu.style.display = "none";
      });
    }

    // 클릭 이벤트 설정
    if (item.onClick) {
      ctxMenuItem.addEventListener("click", item.onClick, false);
    }

    // Item 추가
    ctxMenuItemAnchor.appendChild(ctxMenuItemAnchorText);
    ctxMenuItem.appendChild(ctxMenuItemAnchor);
    ctxMenuList.appendChild(ctxMenuItem);
  });

  // List Element 반환
  return ctxMenuList;
}

//modal 구현npm
openModalButton.addEventListener("click", () => {
  gitStatusModal.style.display = "block";
  disableBodyScroll();

  directories.forEach((dir) => {
    dir.classList.add("modal-open");
  });

  const commitButton = document.querySelector(".commit-button");
  commitButton.addEventListener("click", requestCommit);

  //git status 요청
  axios.get("/dirs/git/status").then((res) => {
    //api로부터 받아온 파일 정보
    const files = res.data.files;

    //각각의 상태에 대한 임시 저장 배열들
    const untrackedT = [];
    const modifiedT = [];
    const stagedT = [];

    for (let file of files) {
      switch (file.status) {
        case "untracked":
          untrackedT.push(file.name);
          break;
        case "staged":
          stagedT.push(file.name);
          break;
        case "modified":
          modifiedT.push(file.name);
          break;
      }
    }
    //전역 배열을 임시 배열 주소로 교체
    untracked = untrackedT;
    staged = stagedT;
    modified = modifiedT;

    render();
  });
});

closeModalButton.addEventListener("click", function () {
  gitStatusModal.style.display = "none";

  const commitButton = document.querySelector(".commit-button");
  commitButton.removeEventListener("click", requestCommit);
  enableBodyScroll();
});

function disableBodyScroll() {
  document.body.style.overflow = "hidden";
}

function enableBodyScroll() {
  document.body.style.overflow = "visible";
}

//git status button update
const res = axios
  .get("/dirs/git/isRepo")
  .then((res) => {
    if (res.data) {
      var pTag = branchButton.querySelector("p");

      axios
        .post("/dirs/git/branch", { mode: "get" })
        .then((res) => {
          console.log(res.data);
          pTag.textContent = res.data;
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      openModalButton.classList.remove("hidden");
      branchButton.classList.remove("hidden");
      logButton.classList.remove("hidden");
      cloneButton.classList.add("hidden");
    }
  })
  .catch((err) => console.log(err));

rootElement.addEventListener("click", (event) => {
  const contextMenu = document.getElementById("context-menu");
  if (contextMenu && !contextMenu.contains(event.target)) {
    contextMenu.remove();
  }
});

branchButton.addEventListener("click", (event) => {
  axios
    .get("/dirs/git/branches")
    .then((res) => {
      const branchList = Object.keys(res.data.data.branches);
      const currentBranch = res.data.data.current;

      const ctxMenu = document.createElement("div");
      ctxMenu.id = "context-menu";
      ctxMenu.className = "custom-context-menu";
      // ctxMenu.style.top = event.pageY + "px";
      // ctxMenu.style.left = event.pageX + "px";

      const targetElement = event.target.tagName.toLowerCase() === "p" ? event.target.parentNode : event.target;
      const buttonRect = targetElement.getBoundingClientRect();
      const buttonBottom = buttonRect.top + buttonRect.height;

      ctxMenu.style.top = buttonBottom + "px";
      ctxMenu.style.left = buttonRect.left + "px";

      ctxMenu.appendChild(
        renderContextMenuList([
          {
            label: "Create new branch",
            onClick: async () => {
              try {
                const input = prompt("Enter branch name");
                if (input !== null) {
                  const response = await axios.post("/dirs/git/branch", {
                    mode: "create",
                    branchName: input,
                  });
                }
                window.location.href = "/";
              } catch (error) {
                console.log(error);
                alert(error.response.data.msg);
              }
            },
          },
          ...branchList.map((branch) => ({
            label: branch,
            onClick: async () => {
              // 클릭 이벤트
            },
            submenu: [
              ...(branch !== currentBranch
                ? [
                    {
                      label: "Checkout",
                      onClick: async () => {
                        try {
                          const response = await axios.post(
                            "/dirs/git/branch",
                            {
                              mode: "checkout",
                              branchName: branch,
                            }
                          );
                          window.location.href = "/";
                        } catch (error) {
                          console.log(error);
                          const errorList =
                            error.response.data.msg.split("Error: error:");
                          alert("!![ERROR] : " + errorList[1]);
                          console.log(branch);
                        }
                      },
                    },
                    {
                      label: "Delete",
                      onClick: async () => {
                        try {
                          const response = await axios.post(
                            "/dirs/git/branch",
                            {
                              mode: "delete",
                              branchName: branch,
                            }
                          );
                          window.location.href = "/";
                        } catch (error) {
                          console.log(error);
                          const errorList =
                            error.response.data.msg.split("Error: error:");
                          alert("!![ERROR] : " + errorList[1]);
                        }
                      },
                    },
                    {
                      label: "Merge",
                      onClick: async () => {
                        try {
                          const response = await axios.post("/dirs/git/merge", {
                            mode: "merge",
                            targetBranch: branch,
                          });
                          if (response.data.type === "success") {
                            alert(response.data.msg);
                            window.location.href = "/";
                          } 
                          window.location.href = "/"; // 성공 시 페이지 리로드
                        } catch (error) {
                          console.log(error);
                          alert(error.response.data.errorData.git.result 
                            + "\n" 
                            + error.response.data.msg
                            + "\n"
                            + "reason: " + error.response.data.errorData.git.conflicts[0].reason + ", file:" + error.response.data.errorData.git.conflicts[0].file);
                        }
                      },
                    },
                  ]
                : []),
              {
                label: "Rename",
                onClick: async () => {
                  try {
                    const input = prompt("Enter branch name");
                    if (input !== null) {
                      const response = await axios.post("/dirs/git/branch", {
                        mode: "rename",
                        branchName: branch,
                        newName: input,
                      });
                    }
                    window.location.href = "/";
                  } catch (error) {
                    console.log(error);
                    const errorList =
                      error.response.data.msg.split("Error: error:");
                    alert("!![ERROR] : " + errorList[1]);
                  }
                },
              },
            ],
          })),
        ])
      );

      document.body.appendChild(ctxMenu);
    })
    .catch((err) => console.log(err));
});

cloneButton.addEventListener("click", (event) => {
  const ctxMenu = document.createElement("div");
  ctxMenu.id = "context-menu";
  ctxMenu.className = "custom-context-menu";

  const targetElement = event.target.tagName.toLowerCase() === "p" ? event.target.parentNode : event.target;
  const buttonRect = targetElement.getBoundingClientRect();
  const buttonBottom = buttonRect.top + buttonRect.height;

  ctxMenu.style.top = buttonBottom + "px";
  ctxMenu.style.left = buttonRect.left + "px";

  ctxMenu.appendChild(
    renderContextMenuList([
      {
        label: "Cloning public Repo",
        onClick: async () => {
          try {
            const repoURL = prompt("Enter public repository address");
            if (repoURL !== null) {
              const response = await axios.post("/dirs/git/clone/public", {
                remoteAddress : repoURL
              })
            } 
            window.location.href = "/";
          } catch (error) {
            console.log(error);
            alert(error.response.data.msg + "\n" + error.response.data.error);
          }
        },
      },
      {
        label: "Cloning private repo",
        onClick: async () => {
          try {
            const repoURL = prompt("Enter private repository address");
            if (repoURL !== null) {
              const response = await axios.post("/dirs/git/clone/private/id", {
                remoteAddress : repoURL
              })

              if (response.data.type === "success") {
                const response = await axios.post("/dirs/git/clone/private/config", {
                  remoteAddress : repoURL
                })
              } else {
                const userId = prompt("Enter ID");
                if (userId !== null) {
                  const token = prompt("Enter Access Token");
                  if (token !== null) {
                    const response = await axios.post("/dirs/git/clone/private/new", {
                      remoteAddress : repoURL,
                      newPrivateId : userId,
                      newPrivateToken : token
                    })
                  }
                }
              }
            }
            window.location.href = "/";
          } catch (error) {
            console.log(error);
            alert(error.response.data.msg + "\n" + error.response.data.error);
          }
        },
      },
    ])
  );
  const prevCtxMenu = document.getElementById("context-menu");
  if (prevCtxMenu) {
    prevCtxMenu.remove();
  }

  document.body.appendChild(ctxMenu);
  event.stopPropagation();
})
/**
 * Click Log button event
 */
logButton.addEventListener("click", async () => {
  try {
    await axios.get(`dirs/git/log`);
    window.location.href = "dirs/git/log";
  } catch (error) {
    window.location.href = "/";
    console.log(error);
  }
});
