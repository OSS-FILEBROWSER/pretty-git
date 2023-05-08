const rootElement = document.querySelector("#root");
const directories = document.querySelectorAll(".directory-item");
const gitStatusDirectories = document.querySelectorAll(".status-directory-item");
const backButton = document.querySelector("#back");
const gitStatusModal = document.querySelector(".git-status-modal");
const openModalButton = document.querySelector(".open-modal");
const closeModalButton = document.querySelector(".close-modal");
const untrackedList = document.querySelector(".status-item.untracked ul");
const modifiedList = document.querySelector(".status-item.modified ul");
const stagedList = document.querySelector(".status-item.staged ul");
const committedList = document.querySelector(".status-item.committed ul");
let untracked = [];
let modified = [];
let staged = [];
let committed = [];
let untracked1 = [];
let modified1 = [];
let staged1 = [];
let committed1 = [];

axios.get("/dirs/git/status").then((res) => {
  //api로부터 받아온 파일 정보
  const files = res.data;

  //각각의 상태에 대한 임시 저장 배열들
  const untrackedT = [];
  const modifiedT = [];
  const stagedT = [];
  const committedT = [];
  //switch를 통해 상태 구분, 각각의 상태에 해당하는 임시 배열 저장소로 push
  files.forEach((file) => {
    switch (file.status) {
      case "untracked":
        untrackedT.push(file.name);
        break;
      case "staged":
        stagedT.push(file.name);
        break;
      case "unstaged":
        modifiedT.push(file.name);
        break;
      case "committed":
        committedT.push(file.name);
        break;
    }
    //전역 배열을 임시 배열 주소로 교체
    untracked1 = untrackedT;
    staged1 = stagedT;
    modified1 = modifiedT;
    committed1 = committedT;
  });
});

directories.forEach((dir) => {
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

  
});

gitStatusDirectories.forEach((dir) => {
  dir.addEventListener("contextmenu", (event) => {
    // 기본 Context Menu가 나오지 않게 차단
    event.preventDefault();
    const directoryName = dir.childNodes[2].innerHTML;

    const ctxMenu = document.createElement("div");

    ctxMenu.id = "context-menu";
    ctxMenu.className = "custom-context-menu";

    //위치 설정
    ctxMenu.style.top = event.pageY + "px";
    ctxMenu.style.left = event.pageX + "px";

    if (untracked1.includes(directoryName)) { //untracked
      ctxMenu.appendChild(
        renderContextMenuList([
          {
            label: "git add",
            onClick: async () => {
              try {
                const response = await axios.post("/dirs/git/init", {dirName: directoryName});
                window.location.href = "/";
              } catch (error) {
                console.log(error);
                alert("something gone wrong while processing git init");
              }
            },
          },
        ])
      );
    } else if (modified1.includes(directoryName)) { //modified
      ctxMenu.appendChild(
        renderContextMenuList([
          {
            label: "git add",
            onClick: async () => {
              try {
                const response = await axios.post("/dirs/git/init", {dirName: directoryName});
                window.location.href = "/";
              } catch (error) {
                console.log(error);
                alert("something gone wrong while processing git init");
              }
            },
          },
          {
            label: "git restore",
            onClick: async() => {
              try {
                const response = await axios.post("/dirs/git/restore/0", {dirName: directoryName});
                window.location.href = "/";
              } catch (error) {
                console.log(error);
                alert("something gone wrong while processing git restore");
              }
            },
          },
        ])
      )
    } else if (staged1.includes(directoryName)) { //staged
      ctxMenu.appendChild(
        renderContextMenuList([
          {
            label: "git restore --staged",
            onClick: async () => {
              try {
                const response = await axios.post("/dirs/git/restore/1", {dirName: directoryName});
                window.location.href = "/";
              } catch (error) {
                console.log(error);
                alert("something gone wrong while processing git restore --staged");
              }
            },
          },
          {
            label: "git commit",
            onClick: async () => {
              try {
                const response = await axios.post("/dirs/git/commit", {dirName: directoryName});
                window.location.href = "/";
              } catch (error) {
                console.log(error);
                alert("something gone wrong while processing git commit");
              }
            }
          }
        ])
      )
    } else if (committed1.includes(directoryName)) {  //committed
      ctxMenu.appendChild(
        renderContextMenuList([
          {
            label: "git rm",
            onClick: async() => {
              try {
                const response = await axios.post("/dirs/git/rm/0", {dirName: directoryName});
                window.location.href = "/";
              } catch (error) {
                console.log(error);
                alert("something gone wrong while processing git rm");
              }
            },
          },
          {
            label: "git rm --cached",
            onClick: async() => {
              try {
                const response = await axios.post("/dirs/git/rm/1", {dirName: directoryName});
                window.location.href = "/";
              } catch (error) {
                console.log(error);
                alert("something gone wrong while processing git rm --cached");
              }
            },
          },
          {
            label: "git mv",
            onClick: async() => {
              try {
                const response = await axios.post(("/dirs/git/mv"), {dirName: directoryName});
                window.location.href = "/";
              } catch (error) {
                console.log(error);
                alert("something gone wrong while processing git mv");
              }
            },
          },
        ])
      )
    }

    // 이전 Element 삭제
    const prevCtxMenu = document.getElementById("context-menu");
    if (prevCtxMenu) {
      prevCtxMenu.remove();
    }

    // Body에 Context Menu를 추가.
    document.body.appendChild(ctxMenu);
  });
})

backButton.addEventListener("click", () => {
  axios.get("/dirs/backward").then((res) => {
    window.location.href = "/";
  });
});

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

  // List Item 생성
  list.forEach(function (item) {
    // Item Element 생성
    const ctxMenuItem = document.createElement("li");
    const ctxMenuItemAnchor = document.createElement("a");
    const ctxMenuItemAnchorText = document.createTextNode(item.label);

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

//modal 구현
openModalButton.addEventListener("click", () => {
  gitStatusModal.style.display = "block";
  disableBodyScroll();

  directories.forEach((dir) => {
    dir.classList.add("modal-open");
  });

  //git status 요청
  axios.get("/dirs/git/status").then((res) => {
    //api로부터 받아온 파일 정보
    const files = res.data;
    //각각의 상태에 대한 임시 저장 배열들
    const untrackedT = [];
    const modifiedT = [];
    const stagedT = [];
    const committedT = [];
    //switch를 통해 상태 구분, 각각의 상태에 해당하는 임시 배열 저장소로 push

    for (let name in files) {
      switch (files[name].status) {
        case "untracked":
          untrackedT.push(name);
          break;
        case "staged":
          stagedT.push(name);
          break;
        case "modified":
          modifiedT.push(name);
          break;
        case "committed":
          committedT.push(name);
          break;
      }
      //전역 배열을 임시 배열 주소로 교체
      untracked = untrackedT;
      staged = stagedT;
      modified = modifiedT;
      committed = committedT;

      render();
    }
  });
});

closeModalButton.addEventListener("click", function () {
  gitStatusModal.style.display = "none";
  enableBodyScroll();
});

function disableBodyScroll() {
  document.body.style.overflow = "hidden";
}

function enableBodyScroll() {
  document.body.style.overflow = "visible";
}


//root element event 관련
rootElement.addEventListener("click", handleClearContextMenu);
