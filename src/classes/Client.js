import fs, { stat } from "fs";
import path from "path";
import { spawn } from "child_process";
//class import
import History from "./History.js";

export default class Client {
  constructor() {
    this._path = "/";
    this._history = new History("/");
  }

  getFilesInCurrentDir = () => {
    const files = fs.readdirSync(this._path);
    return files;
  };

  setHistory = (newHistory) => {
    newHistory.prev = this._history;
    this._history = newHistory; //현재 위치 교체
  };

  popHistory = () => {
    this._history = this._history.prev;
  };

  //data 조작의 오류를 막기 위해 getter, setter 설정.
  get path() {
    return this._path;
  }

  set path(newPath) {
    this._path = newPath;
  }

  get history() {
    return this._history;
  }
}
