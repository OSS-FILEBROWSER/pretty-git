//linked list 기반 디렉토리 히스토리 구현
export default class History {
  constructor(data, prev = null) {
    this.data = data;
    this.prev = prev;
  }
}
