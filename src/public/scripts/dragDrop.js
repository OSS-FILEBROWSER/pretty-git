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
  addDragListeners(committedList, committed);

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
  committedList.innerHTML = "";

  untracked.forEach((fileName) => {
    const li = document.createElement("li");
    li.textContent = fileName;
    li.setAttribute("draggable", "true");
    untrackedList.appendChild(li);
  });

  modified.forEach((fileName) => {
    const li = document.createElement("li");
    li.textContent = fileName;
    li.setAttribute("draggable", "true");
    modifiedList.appendChild(li);
  });

  staged.forEach((fileName) => {
    const li = document.createElement("li");
    li.textContent = fileName;
    li.setAttribute("draggable", "true");
    stagedList.appendChild(li);
  });

  committed.forEach((fileName) => {
    const li = document.createElement("li");
    li.textContent = fileName;
    li.setAttribute("draggable", "true");
    committedList.appendChild(li);
  });

  handleDragDrop();
}