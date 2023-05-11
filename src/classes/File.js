export default class File {
  constructor(type, name, isAlreadyInit, status, statusType) {
    this.type = type;
    this.name = name;
    this.initialized = isAlreadyInit;
    this.status = status;
    this.statusType = statusType;
  }
}
