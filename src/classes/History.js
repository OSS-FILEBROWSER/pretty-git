//linked list 기반 디렉토리 히스토리 구현
export default class History {
  constructor(path, isRepo, dirStatus, prev = null) {
    this.path = path;
    this.isRepo = isRepo;
    this.directoryStatus = dirStatus;
    this.prev = prev;
  }
}
