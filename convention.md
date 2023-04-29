# pretty-git-branch-convention

### 네이밍룰

#### FE

- components 이름: Pascal case

  ex. `Header.js`, `Footer.js`

- non-components 이름: Camel case

  ex. `myUtilityFile.js`, `cookieHelper.js`

- 속성명: Camel case

  ex. `onClick`, `onSubmit`

- inline 스타일: Camel case

  ex. `fontSize`, `fontWeight`

#### BE

기본적으로 CamelCase 규칙을 따른다.

- 클래스이름: `MyClass`
  - 대문자로 시작
- 변수명: `myValue`
  - 소문자로 시작
- 메서드 이름: `doSomething`
  - 동사가 먼저 작성되도록 한다.
  - 소문자로 시작
- 정적 변수에 한해서만 대문자 + snake 표기법을 따른다.
  - ex) `MY_STATIC_FIELD`
- priavte member : 언더스코어로 시작
  - ex) `_privateVar`

### 커밋 컨벤션

기본적인 커밋 메시지 구조 (각 파트는 빈줄로 구분한다.)

- 제목 (Type: Subject)
  - (한줄 띄어 분리)
- 본문 (Body)
  - (한줄 띄어 분리)
- 꼬리말 (Footer)

다음은 제목에 해당하는 커밋 타입이다.

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
- `refactor`: 코드 리펙토링
- `test`: 테스트 코드, 리펙토링 테스트 코드 추가
- `chore`: 빌드 업무 수정, 패키지 매니저 수정
- ex) feat: 로그인 기능 구현
  - : 뒤의 메시지는 알아보기 쉽게만 작성, 따로 컨벤션을 두진 않음

현재 프로젝트에서는 꼬리말을 생략한다.

### 깃 전략 (git flow)

- `main` : 제품으로 출시될 수 있는 브랜치
- `develop` : 다음 출시 버전을 개발하는 브랜치
- `feature` : 기능을 개발하는 브랜치
- `hotfix` : 출시 버전에서 발생한 버그를 수정 하는 브랜치

### 작업 방식

1. `main` → `develop` 분기
   - 최신 배포 직후에는 `main`과 `develop` 변경 사항이 동일함
2. `develop` → `feature/{기능 이름}` 분기
3. 작업 후 `feature` → `develop` PR
   1. 충돌 해결 및 테스트 코드 pass 확인 (CI)
4. 코드 리뷰 진행
   1. 최소 1번
5. `feature` → `develop` Merge
   1. Squash and Merge
   2. merge 후 `featrue` 브랜치 자동 삭제
6. 배포 시점에 `develop` → `main` PR 및 Merge
   1. Merge commit or Rebase and Merge
   2. CI/CD 작동
7. 애플리케이션 장애가 발생하면 `main` → `hotfix/{문제상황}` 브랜치로 분기
   1. 버그를 고치고 `main`으로 merge

### PR 탬플릿

- 작업 내용
- 리뷰 해줬으면 좋겠는 부분 (고민한 내용)
- 참고 사항
- 스크린샷(fe)
