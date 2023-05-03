const directories = document.querySelectorAll(".directory-name");
const backButton = document.querySelector("#back");

directories.forEach((dir) => {
  dir.addEventListener("dblclick", () => {
    const directoryName = dir.innerHTML; // 현재 디렉토리 이름
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

function handleCreateContextMenu(event){
  // 기본 Context Menu가 나오지 않게 차단
  event.preventDefault();
  
  const ctxMenu = document.createElement('div');
  
  ctxMenu.id = 'context-menu';
  ctxMenu.className = 'custom-context-menu';
  
  //위치 설정
  ctxMenu.style.top = event.pageY+'px';
  ctxMenu.style.left = event.pageX+'px';
  
  // 메뉴 목록 생성
  ctxMenu.appendChild(renderContextMenuList([
    {
     label: "git init",
      onClick: function(event){
        //클릭 이벤트 구현
      }
    },
    {
     label: "git commit",
      onClick: function(event){
        //클릭 이벤트 구현
      }
    },
  ]));
  
  // 이전 Element 삭제
  const prevCtxMenu = document.getElementById( 'context-menu' );
  if( prevCtxMenu ){
    prevCtxMenu.remove();
  }
  
  // Body에 Context Menu를 추가.
  document.body.appendChild( ctxMenu );
}

// context menu 없애기
function handleClearContextMenu(event){
  const ctxMenu = document.getElementById('context_menu');
  if( ctxMenu ){
    ctxMenu.remove();
  }
}

function renderContextMenuList( list ){
  // List Element 생성
  const ctxMenuList = document.createElement('ul');
  
  // List Item 생성
  list.forEach(function( item ){
    // Item Element 생성
    const ctxMenuItem = document.createElement('li');
    const ctxMenuItem_a = document.createElement('a');
    const ctxMenuItem_a_text = document.createTextNode(item.label);
    
    // 클릭 이벤트 설정
    if( item.onClick ){
      ctxMenuItem.addEventListener( 'click', item.onClick, false );
    }

    // Item 추가
    ctxMenuItem_a.appendChild( ctxMenuItem_a_text );
    ctxMenuItem.appendChild( ctxMenuItem_a );
    ctxMenuList.appendChild( ctxMenuItem );
  });
  
  // List Element 반환
  return ctxMenuList;
}

document.addEventListener('contextmenu', handleCreateContextMenu, false);
document.addEventListener('click', handleClearContextMenu, false);