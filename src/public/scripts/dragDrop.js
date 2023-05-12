//드래그 앤 드롭 구현
render();

function render() {
  untrackedList.innerHTML = "";
  modifiedList.innerHTML = "";
  stagedList.innerHTML = "";

  axios.get("/dirs/files").then((res) => {
    const files = res.data;

    for (let file of files) {
      const li = document.createElement("li");
      switch (file.status) {
        case "untracked":
          if(file.type) {
            li.textContent = file.name + '(' + file.type + ')';
            untrackedList.appendChild(li);
          } else {
            li.textContent = file.name;
            untrackedList.appendChild(li);
          }
          break;
        case "staged":
          if(file.type) {
            li.textContent = file.name + '(' + file.type + ')';
            stagedList.appendChild(li);
          } else {
            li.textContent = file.name;
            stagedList.appendChild(li);
          }
          break;
        case "modified":
          if(file.type) {
            li.textContent = file.name + '(' + file.type + ')';
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
  untrackedList.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    const li = event.target.closest("li");
    if (!li) {
      return;
    }

    const directoryName = li.textContent.trim();

    const ctxMenu = document.createElement("div");
  
    ctxMenu.id = "context-menu";
    ctxMenu.className = "custom-context-menu";

    //위치 설정
    ctxMenu.style.top = event.pageY + "px";
    ctxMenu.style.left = event.pageX + "px";

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
        }
      ])
    )

    // 이전 Element 삭제
    const prevCtxMenu = document.getElementById("context-menu");
    if (prevCtxMenu) {
      prevCtxMenu.remove();
    }
    // document.body.appendChild(ctxMenu);
    gitStatusModal.appendChild(ctxMenu);
  })

  modifiedList.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    const li = event.target.closest("li");
    if (!li) {
      return;
    }

    const directoryName = li.textContent.trim();

    const ctxMenu = document.createElement("div");
  
    ctxMenu.id = "context-menu";
    ctxMenu.className = "custom-context-menu";

    //위치 설정
    ctxMenu.style.top = event.pageY + "px";
    ctxMenu.style.left = event.pageX + "px";

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
    )

    // 이전 Element 삭제
    const prevCtxMenu = document.getElementById("context-menu");
    if (prevCtxMenu) {
      prevCtxMenu.remove();
    }
    // document.body.appendChild(ctxMenu);
    gitStatusModal.appendChild(ctxMenu);
  })

  stagedList.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    const li = event.target.closest("li");
    if (!li) {
      return;
    }

    const directoryName = li.textContent.trim();

    const ctxMenu = document.createElement("div");
  
    ctxMenu.id = "context-menu";
    ctxMenu.className = "custom-context-menu";

    //위치 설정
    ctxMenu.style.top = event.pageY + "px";
    ctxMenu.style.left = event.pageX + "px";
    
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
                commitMessage: commitText
              });
              window.location.href = "/";
            } catch (error) {
              console.log(error);
              alert("something gone wrong while processing git commit");
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
    gitStatusModal.appendChild(ctxMenu);
  })

  // stagedItem.forEach((item) => {
  //   item.addEventListener("contextmenu", (event) => {
  //     event.preventDefault();

  //     const directoryName = item.textContent;
  
  //     const ctxMenu = document.createElement("div");
  
  //     ctxMenu.id = "context-menu";
  //     ctxMenu.className = "custom-context-menu";
  
  //     //위치 설정
  //     ctxMenu.style.top = event.pageY;
  //     ctxMenu.style.left = event.pageX;
      
  //     ctxMenu.appendChild(
  //       renderContextMenuList([
  //         {
  //           label: "git restore --staged",
  //           onClick: async () => {
  //             try {
  //               const response = await axios.post("/dirs/git/restore/1", {
  //                 fileName: directoryName,
  //               });
  //               window.location.href = "/";
  //             } catch (error) {
  //               console.log(error);
  //               alert(
  //                 "something gone wrong while processing git restore --staged"
  //               );
  //             }
  //           },
  //         },
  //         {
  //           label: "git commit",
  //           onClick: async () => {
  //             try {
  //               const commitText = prompt("commit message 입력");
  //               const response = await axios.post("/dirs/git/commit", {
  //                 fileName: directoryName,
  //                 commitMessage: commitText
  //               });
  //               window.location.href = "/";
  //             } catch (error) {
  //               console.log(error);
  //               alert("something gone wrong while processing git commit");
  //             }
  //           },
  //         },
  //       ])
  //     )
  //     // 이전 Element 삭제
  //     const prevCtxMenu = document.getElementById("context-menu");
  //     if (prevCtxMenu) {
  //       prevCtxMenu.remove();
  //     }
  //     // document.body.appendChild(ctxMenu);
  //     item.appendChild(ctxMenu);
  //   })
  // })
}