const rootElement = document.querySelector("#root");
const directories = document.querySelectorAll(".directory-item");
const backButton = document.querySelector("#back");
const gitStatusModal = document.querySelector(".git-status-modal");
const openModalButton = document.querySelector(".open-modal");
const closeModalButton = document.querySelector(".close-modal");
const untrackedList = document.querySelector(".status-item.untracked ul");
const modifiedList = document.querySelector(".status-item.modified ul");
const stagedList = document.querySelector(".status-item.staged ul");
const committedList = document.querySelector(".status-item.committed ul");
const untracked = ["new.txt", "new2.txt"];
const modified = ["new3.txt", "new4.txt", "new5.txt"];
const staged = ["new6.txt", "new7.txt"];
const committed = ["new8.txt"];

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
          case "EPERM":
            alert("No permission to access this directory");
        }
      });
  });

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

    // 메뉴 목록 생성
    ctxMenu.appendChild(
      renderContextMenuList([
        {
          label: "git init",
          onClick: async () => {
            //클릭 이벤트 구현
            //event.srcElement는 click 이벤트를 발생시킨 원천 엘리먼트를 가르킨다.
            try {
              const response = await axios.post("/dirs/git/init", {
                dirName: directoryName,
              });
              window.location.href = "/";
            } catch (error) {
              console.log(error);
              alert("something gone wrong while processing git init");
            }
          },
        },
        {
          label: "git commit",
          onClick: async () => {
            //클릭 이벤트 구현
          },
        },
      ])
    );

    // 이전 Element 삭제
    const prevCtxMenu = document.getElementById("context-menu");
    if (prevCtxMenu) {
      prevCtxMenu.remove();
    }

    // Body에 Context Menu를 추가.
    document.body.appendChild(ctxMenu);
  });

  //파일의 상태가 untracked인지 modified인지 staged인지 분류
  if (dir.childNodes[4] === "untracked") {
    untracked.push(dir.childNodes[2]);
  } else if (dir.childNodes[4] === "modified") {
    modified.push(dir.childNodes[2]);
  } else if (dir.childNodes[4] === "staged") {
    staged.push(dir.childNodes[2]);
  } else if (dir.childNodes[4] === "committed") {
    committed.push(dir.childNodes[2]);
  }

});

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
  gitStatusModal.style.display = 'block';
  disableBodyScroll();

  directories.forEach((dir) => {
    dir.classList.add('modal-open');
  })
});

closeModalButton.addEventListener('click', function() {
  gitStatusModal.style.display = 'none';
  enableBodyScroll();
});

function disableBodyScroll() {
  document.body.style.overflow = 'hidden';
}

function enableBodyScroll() {
  document.body.style.overflow = 'visible';
}



//root element event 관련
rootElement.addEventListener("click", handleClearContextMenu);