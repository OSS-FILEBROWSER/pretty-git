//드래그 앤 드롭 구현
render();

// function handleDragDrop() {

//   untrackedList.querySelectorAll("li").forEach((li) => {
//     li.addEventListener("dragstart", (e) => {
//       e.dataTransfer.setData("text/plain", e.target.textContent);
//       e.dataTransfer.effectAllowed = "move";
//     });

//     li.addEventListener("drag", (e) => {});
//   });

//   modifiedList.addEventListener("dragover", (e) => {
//     e.preventDefault();
//   });

//   modifiedList.addEventListener("drop", (e) => {
//     e.preventDefault();
//     const fileName = e.dataTransfer.getData("text/plain");
//     modified.push(fileName);

//     const index = untracked.indexOf(fileName);
//     untracked.splice(index, 1);

//     //untrackedList에서 옮겨진 li 태그를 삭제
//     const liToDelete = untrackedList.querySelector(`li:nth-child(${index + 1})`);
//     untrackedList.removeChild(liToDelete);

//     render();
//   });
// }

function addDragListeners(list, state) {
  list.querySelectorAll("li").forEach((li) => {
    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", e.target.textContent);
      e.dataTransfer.effectAllowed = "move";
    });

    li.addEventListener("drag", (e) => {});
  });
}

// function handleDragDrop() {
//   addDragListeners(untrackedList, untracked);
//   addDragListeners(modifiedList, modified);
//   addDragListeners(stagedList, staged);
//   // addDragListeners(committedList, committed);

//   modifiedList.addEventListener("dragover", (e) => {
//     e.preventDefault();
//   });

//   modifiedList.addEventListener("drop", (e) => {
//     e.preventDefault();
//     const fileName = e.dataTransfer.getData("text/plain");
//     modified.push(fileName);

//     const index = untracked.indexOf(fileName);
//     untracked.splice(index, 1);

//     //untrackedList에서 옮겨진 li 태그를 삭제
//     const liToDelete = untrackedList.querySelector(
//       `li:nth-child(${index + 1})`
//     );
//     untrackedList.removeChild(liToDelete);

//     untrackedList.querySelectorAll("li").forEach((li, i) => {
//       li.dataset.index = i;
//     });

//     render();
//   });

//   // stagedList.addEventListener("dragover", (e) => {
//   //   e.preventDefault();
//   // });

//   // stagedList.addEventListener("drop", (e) => {
//   //   e.preventDefault();
//   //   const fileName = e.dataTransfer.getData("text/plain");
//   //   staged.push(fileName);

//   //   const index = modified.indexOf(fileName);
//   //   modified.splice(index, 1);

//   //   const liToDelete = modifiedList.querySelector(`li:nth-child(${index + 1})`);
//   //   modifiedList.removeChild(liToDelete);

//   //   modifiedList.querySelectorAll("li").forEach((li, i) => {
//   //     li.dataset.index = i;
//   //   });

//   //   render();
//   // });
// }

function render() {
  untrackedList.innerHTML = "";
  modifiedList.innerHTML = "";
  stagedList.innerHTML = "";

  axios.get("/dirs/files").then((res) => {
    //api로부터 받아온 파일 정보
    const files = res.data;

    for (let file of files) {
      const li = document.createElement("li");
      switch (file.status) {
        case "untracked":
          if (file.type) {
            li.textContent = file.name + "(" + file.type + ")";
            untrackedList.appendChild(li);
          } else {
            li.textContent = file.name;
            untrackedList.appendChild(li);
          }
          break;
        case "staged":
          if (file.type) {
            console.log(file.type);
            li.textContent = file.name + "(" + file.type + ")";
            stagedList.appendChild(li);
          } else {
            li.textContent = file.name;
            stagedList.appendChild(li);
          }
          break;
        case "modified":
          if (file.type) {
            li.textContent = file.name + "(" + file.type + ")";
            modifiedList.appendChild(li);
          } else {
            li.textContent = file.name;
            modifiedList.appendChild(li);
          }
          break;
      }
    }
  });
  handleModal();
}

function handleModal() {
  const untrackedItem = document.querySelectorAll(
    "div.status-item.untracked ul li"
  );
  const modifiedItem = document.querySelectorAll(
    "div.status-item.modified ul li"
  );
  const stagedItem = document.querySelectorAll("div.status-item.staged ul li");

  untrackedItem.forEach((item) => {
    item.addEventListener("contextmenu", (event) => {
      event.preventDefault();

      const directoryName = item.textContent;

      const ctxMenu = document.createElement("div");

      ctxMenu.id = "context-menu";
      ctxMenu.className = "custom-context-menu";

      //위치 설정
      ctxMenu.style.top = event.pageY;
      ctxMenu.style.left = event.pageX;

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

      // 이전 Element 삭제
      const prevCtxMenu = document.getElementById("context-menu");
      if (prevCtxMenu) {
        prevCtxMenu.remove();
      }
      // document.body.appendChild(ctxMenu);
      item.appendChild(ctxMenu);
    });
  });

  modifiedItem.forEach((item) => {
    item.addEventListener("contextmenu", (event) => {
      event.preventDefault();

      const directoryName = item.textContent;

      const ctxMenu = document.createElement("div");

      ctxMenu.id = "context-menu";
      ctxMenu.className = "custom-context-menu";

      //위치 설정
      ctxMenu.style.top = event.pageY;
      ctxMenu.style.left = event.pageX;

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

      // 이전 Element 삭제
      const prevCtxMenu = document.getElementById("context-menu");
      if (prevCtxMenu) {
        prevCtxMenu.remove();
      }
      // document.body.appendChild(ctxMenu);
      item.appendChild(ctxMenu);
    });
  });

  stagedItem.forEach((item) => {
    item.addEventListener("contextmenu", (event) => {
      event.preventDefault();

      const directoryName = item.textContent;

      const ctxMenu = document.createElement("div");

      ctxMenu.id = "context-menu";
      ctxMenu.className = "custom-context-menu";

      //위치 설정
      ctxMenu.style.top = event.pageY;
      ctxMenu.style.left = event.pageX;

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
          {
            label: "git commit",
            onClick: async () => {
              try {
                const commitText = prompt("commit message 입력");
                const response = await axios.post("/dirs/git/commit", {
                  fileName: directoryName,
                  commitMessage: commitText,
                });
                window.location.href = "/";
              } catch (error) {
                console.log(error);
                alert("something gone wrong while processing git commit");
              }
            },
          },
        ])
      );
      // 이전 Element 삭제
      const prevCtxMenu = document.getElementById("context-menu");
      if (prevCtxMenu) {
        prevCtxMenu.remove();
      }
      // document.body.appendChild(ctxMenu);
      item.appendChild(ctxMenu);
    });
  });
}

gitStatusModal.addEventListener("show.bs.modal", handleModal);
