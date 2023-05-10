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

function handleDragDrop() {
  addDragListeners(untrackedList, untracked);
  addDragListeners(modifiedList, modified);
  addDragListeners(stagedList, staged);
  // addDragListeners(committedList, committed);

  modifiedList.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  modifiedList.addEventListener("drop", (e) => {
    e.preventDefault();
    const fileName = e.dataTransfer.getData("text/plain");
    modified.push(fileName);

    const index = untracked.indexOf(fileName);
    untracked.splice(index, 1);

    //untrackedList에서 옮겨진 li 태그를 삭제
    const liToDelete = untrackedList.querySelector(`li:nth-child(${index + 1})`);
    untrackedList.removeChild(liToDelete);

    untrackedList.querySelectorAll("li").forEach((li, i) => {
      li.dataset.index = i;
    });

    render();
  });

  // stagedList.addEventListener("dragover", (e) => {
  //   e.preventDefault();
  // });

  // stagedList.addEventListener("drop", (e) => {
  //   e.preventDefault();
  //   const fileName = e.dataTransfer.getData("text/plain");
  //   staged.push(fileName);

  //   const index = modified.indexOf(fileName);
  //   modified.splice(index, 1);

  //   const liToDelete = modifiedList.querySelector(`li:nth-child(${index + 1})`);
  //   modifiedList.removeChild(liToDelete);

  //   modifiedList.querySelectorAll("li").forEach((li, i) => {
  //     li.dataset.index = i;
  //   });

  //   render();
  // });
}

function render() {
  untrackedList.innerHTML = "";
  modifiedList.innerHTML = "";
  stagedList.innerHTML = "";
  // committedList.innerHTML = "";

  untracked.forEach((fileName) => {
    const li = document.createElement("li");
    li.textContent = fileName;
    // li.setAttribute("draggable", "true");
    untrackedList.appendChild(li);
  });

  modified.forEach((fileName) => {
    const li = document.createElement("li");
    li.textContent = fileName;
    // li.setAttribute("draggable", "true");
    modifiedList.appendChild(li);
  });

  staged.forEach((fileName) => {
    const li = document.createElement("li");
    li.textContent = fileName;
    // li.setAttribute("draggable", "true");
    stagedList.appendChild(li);
  });

  // committed.forEach((fileName) => {
  //   const li = document.createElement("li");
  //   li.textContent = fileName;
  //   li.setAttribute("draggable", "true");
  //   committedList.appendChild(li);
  // });

  // handleDragDrop();
  handleModal();
}

function handleModal() {
  const untrackedItem = document.querySelectorAll("div.status-item.untracked ul li");
  const modifiedItem = document.querySelectorAll("div.status-item.modified ul li");
  const stagedItem = document.querySelectorAll("div.status-item.staged ul li");

  untrackedItem.forEach((item) => {
    item.addEventListener("contextmenu", (event) => {
      event.preventDefault();

      const ctxMenu = document.createElement("div");
  
      ctxMenu.id = "context-menu";
      ctxMenu.className = "custom-context-menu";
  
      //위치 설정
      ctxMenu.style.top = event.pageY;
      ctxMenu.style.left = event.pageX;

      // ctxMenu.appendChild(
      //   renderContextMenuList([
      //     {
      //       //구현
      //     }
      //   ])
      // )
      // 이전 Element 삭제
      const prevCtxMenu = document.getElementById("context-menu");
      if (prevCtxMenu) {
        prevCtxMenu.remove();
      }
      // document.body.appendChild(ctxMenu);
      item.appendChild(ctxMenu);
    })
  })

  modifiedItem.forEach((item) => {
    item.addEventListener("contextmenu", (event) => {
      event.preventDefault();

      const ctxMenu = document.createElement("div");
  
      ctxMenu.id = "context-menu";
      ctxMenu.className = "custom-context-menu";
  
      //위치 설정
      ctxMenu.style.top = event.pageY;
      ctxMenu.style.left = event.pageX;

      // ctxMenu.appendChild(
      //   renderContextMenuList([
      //     {
      //       //구현
      //     }
      //   ])
      // )

      // 이전 Element 삭제
      const prevCtxMenu = document.getElementById("context-menu");
      if (prevCtxMenu) {
        prevCtxMenu.remove();
      }
      // document.body.appendChild(ctxMenu);
      item.appendChild(ctxMenu);
    })
  })

  stagedItem.forEach((item) => {
    item.addEventListener("contextmenu", (event) => {
      event.preventDefault();
  
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
        ])
      )
      // 이전 Element 삭제
      const prevCtxMenu = document.getElementById("context-menu");
      if (prevCtxMenu) {
        prevCtxMenu.remove();
      }
      // document.body.appendChild(ctxMenu);
      item.appendChild(ctxMenu);
    })
  })
}

gitStatusModal.addEventListener("show.bs.modal", handleModal);