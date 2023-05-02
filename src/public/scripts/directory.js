const directories = document.querySelectorAll(".directory-item");
const backButton = document.querySelector("#back");

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
});

backButton.addEventListener("click", () => {
  axios.get("/dirs/backward").then((res) => {
    window.location.href = "/";
  });
});
