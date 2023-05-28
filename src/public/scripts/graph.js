const graphBox = document.getElementById("graph-container");

function calculateDistance(element1, element2) {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();

  const distanceX = rect2.left - rect1.left;
  const distanceY = rect2.top - rect1.top;

  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  return distance;
}

function draw(graph2D) {
  let i = 0;
  for (let graphData of graph2D) {
    const graphFlex = document.createElement("div");
    graphBox.appendChild(graphFlex);
    graphFlex.className = "graph-flex";

    let j = 0;
    for (let shape of graphData.graph) {
      const graphLine = document.createElement("div");
      graphLine.classList.add("graph-box");

      switch (shape) {
        case "|": {
          //straight
          const straight = document.createElement("div");
          straight.classList.add("straight-line");
          graphLine.appendChild(straight);
          break;
        }
        case "\\": {
          //right
          const diaogonal = document.createElement("div");
          diaogonal.className = "right-diagonal";
          graphLine.appendChild(diaogonal);

          if (graph2D[i + 1].graph[j + 1] == "|") {
            const bottomRightHalf = document.createElement("div");
            bottomRightHalf.classList.add("bottom-half-right-line");
            graphLine.appendChild(bottomRightHalf);
          }

          if (graph2D[i - 1].graph[j - 1] == "|") {
            const topLeftHalf = document.createElement("div");
            topLeftHalf.classList.add("top-half-left-line");
            graphLine.appendChild(topLeftHalf);
          }

          break;
        }
        case "/": {
          //left
          const diaogonal = document.createElement("div");
          diaogonal.className = "left-diagoanl";
          graphLine.appendChild(diaogonal);

          if (graph2D[i + 1].graph[j - 1] == "|") {
            const bottomLeftHalf = document.createElement("div");
            bottomLeftHalf.classList.add("bottom-half-left-line");
            graphLine.appendChild(bottomLeftHalf);
          }

          if (graph2D[i - 1].graph[j + 1] == "|") {
            const topRightHalf = document.createElement("div");
            topRightHalf.classList.add("top-half-right-line");
            graphLine.appendChild(topRightHalf);
          }

          break;
        }
        case "_": {
          const bottom = document.createElement("div");
          bottom.classList.add("bottom-line");
          graphLine.appendChild(bottom);

          if (graphData.graph[j - 1] == "|") {
            const bottomLeftHalf = document.createElement("div");
            bottomLeftHalf.classList.add("bottom-half-left-line");
            graphLine.appendChild(bottomLeftHalf);
          }
          if (graphData.graph[j + 1] == "|") {
            const bottomRightHalf = document.createElement("div");
            bottomRightHalf.classList.add("bottom-half-right-line");
            graphLine.appendChild(bottomRightHalf);
          }
          break;
        }
        case "*": {
          const commitObj = document.createElement("div");
          commitObj.className = "commit-object";
          graphLine.appendChild(commitObj);
          break;
        }
      }
      j++;
      graphFlex.appendChild(graphLine);
    }

    if (graphData.commit) {
      const commitMessage = graphData.commit;
      const commitHash = commitMessage.split("-")[0].trim();
      const commitBody = document.createElement("div");
      commitBody.classList.add("commit-body");
      graphFlex.appendChild(commitBody);
      commitBody.innerText = commitMessage;

      const commitObj = graphFlex.querySelector(".commit-object");
      commitObj.classList.add(commitHash);
      const distanceTo =
        calculateDistance(commitObj, commitBody) - commitObj.offsetWidth;
      //   const distanceTo =
      //     commitBody.offsetLeft - (commitObj.offsetLeft + commitObj.offsetWidth);

      const commitLinker = document.createElement("div");
      commitBody.appendChild(commitLinker);
      commitLinker.classList.add("spotted-line");

      commitLinker.style.width = `${distanceTo}px`;
      commitLinker.style.left = `-${distanceTo - 5}px`;
    }
    i++;
  }
}

axios
  .post("/dirs/git/branch", { mode: "get" })
  .then((branchRes) => {
    axios
      .post("/dirs/git/logData", { branchName: branchRes.data })
      .then((res) => {
        const log = res.data;
        const lines = log[0].hash.split("\n");

        const graph2D = [];

        lines.forEach((line) => {
          const lineData = line.split("$");
          const refinedData = {};

          if (lineData[0]) {
            let graphContainer = [];
            const graphLine = lineData[0].trim();
            for (let i = 0; i < graphLine.length; i++) {
              graphContainer.push(graphLine[i]);
            }
            refinedData["graph"] = graphContainer;
          } else {
            refinedData["graph"] = [];
          }

          if (lineData[1]) {
            refinedData["commit"] = lineData[1].trim();
          } else {
            refinedData["commit"] = "";
          }

          graph2D.push(refinedData);
        });

        draw(graph2D);

        const commitObjects = document.querySelectorAll(".commit-object");
        const popup = document.getElementById("commit-popup");

        const closeButton = popup.querySelector(".popup-close");
        closeButton.addEventListener("click", function () {
          popup.style.display = "none";
        });

        for (let co of commitObjects) {
          co.addEventListener("click", () => {
            const previousPopupContent =
              popup.querySelectorAll(".popup-content");
            for (let content of previousPopupContent) {
              popup.removeChild(content);
            }

            popup.style.display = "block";

            const buttonRect = co.getBoundingClientRect();
            const buttonRight = buttonRect.right;
            const buttonTop = buttonRect.top;
            const winScrollY = window.scrollY;
            popup.style.left = buttonRight + 20 + "px";
            popup.style.top = buttonTop + winScrollY + "px";

            axios
              .post("/dirs/git/commitDetail", { checkSum: co.classList[1] })
              .then((res) => {
                const lines = res.data.split("\n");
                for (let line of lines) {
                  const paragraph = document.createElement("p");
                  paragraph.classList.add("popup-content");
                  const lineData = line.split(/(?<=^\S+)\s/);
                  const head = lineData[0];
                  const body = lineData[1];

                  if (
                    line != "" &&
                    (head == "tree" ||
                      head == "parent" ||
                      head == "author" ||
                      head == "committer")
                  ) {
                    paragraph.innerHTML = `<span class="commit-content-head">${head}</span> : <span class="commit-content-body">${body}</span>`;
                  } else {
                    paragraph.innerText = line;
                  }

                  popup.appendChild(paragraph);
                }
              });
          });
        }
      })
      .catch((err) => {
        window.location.href = "/";
        console.log(err);
      });
  })
  .catch((err) => {
    window.location.href = "/";
    console.log(err);
  });
