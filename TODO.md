# Feature1 (파일 탐색)

- ~~루트 디렉토리에서 파일 탐색 시작~~
  - ~~유저 path 경로 정하기(완료)~~
  - ~~유저 클래스를 actor처럼 만들어서 , 클래스 내에 현재 path 정보를 기반으로 유저가 클릭시 path를 업데이트하고 프론트엔드에서 렌더링~~
  - ~~서버 최초 작동 시, 한 유저에 대해 root route에서 유저 클래스 instance생성~~
  - ~~template 골격 작성(완료)~~
  - ~~파일시스템으로부터 얻은 정보로 프론트엔드에 디렉토리 표시~~
  - ~~directory 인지 file인지 구분~~
- ~~모든 디렉토리들은 아이콘, 이름, 확장자로 구분~~
  - ~~프론트엔드에서 파일 유형을 통해 해당 부분 결정~~
- ~~유저는 더블 클릭으로 디렉토리 이동 가능~~
- (optional) 유저는 파일 삭제, 복사, 파일 실행등의 작업을 할 수 있음

# Feature2 (깃 레포 생성)

- ~~현재 local directory를 깃 레포로 바꾸는 기능~~
  - ~~git init 지원~~
  - ~~아직 깃 레포가 아닌 디렉토리와 구분하는 기능~~
    - ~~최초 디렉토리 이동 시 모든 디렉토리 및 파일을 탐색하며 .git 디렉토리가 존재하는지 체크~~
    - ~~추가 : .git 디렉토리에 존재해야하는 모든 파일과 디렉토리 또한 체크해야할까? - 악성 유저가 그냥 의미없는 .git 디렉토리를 생성했을 경우에 대한 예방책~~

# Feature3 (버전 컨트롤 지원)

- ~~깃 레포가 생성된 디렉토리는 파일마다 다른 status를 시각적으로 표현~~
  - !!ex. untracked: 빨강, modified: 주황 등등 색깔로 표현 + 짧은 글귀~~
- ~~선택된 파일에 대한 깃 명령어 지원~~
  - ~~status기반으로 지원할 수 있는 명령어를 다르게 설정~~
  - ~~For untracked files:~~
    - ~~Adding the new files into a staging area (untracked -> staged; git add)~~
  - ~~For modified files~~
    - ~~Adding the modified files into a staging area (modified -> staged; git add)~~
    - ~~Undoing the modification (modified -> unmodified; git restore)~~
  - ~~For staged files~~
    - ~~Unstaging changes (staged -> modified or untracked; git restore --staged)~~
  - ~~For committed or unmodified files~~
    - ~~Untracking files (committed -> untracked; git rm --cached)~~
    - ~~Deleting files (committed -> staged; git rm)~~
    - ~~Renaming files (committed -> staged; git mv)~~
  - 스테이징된 change를 커밋하기 위한 별도의 메뉴
    - ~~커밋 메뉴 클릭 -> 스테이지 영역의 아이템 리스트 표시~~
    - 커밋을 확정하면 -> 커밋 시작
    - ~~커밋된 이후 파일을 committed 상태로 변경~~

# Chore

1. Readme에 플랫폼별 노드 설치 방법 명시
2. nodemon수동 설치 명령어 명시
