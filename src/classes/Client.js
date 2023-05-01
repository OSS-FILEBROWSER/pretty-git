import fs from "fs";
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
    return new Promise((resolve, reject) => {
      let files = [];
      fs.readdir(this._path, (err, fileList) => {
        if (err) {
          reject(err);
        } else {
          Promise.all(
            fileList.map((file) => {
              return new Promise((resolve, reject) => {
                fs.stat(`${this._path}${file}`, (err, stats) => {
                  if (err) {
                    files.push({ type: "unknown", name: file });
                  } else {
                    if (stats.isDirectory()) {
                      files.push({ type: "directory", name: file });
                    } else if (stats.isFile()) {
                      files.push({ type: "file", name: file });
                    } else {
                      files.push({ type: "unknown", name: file });
                    }
                  }
                  resolve();
                });
              });
            })
          )
            .then(() => {
              resolve(files);
            })
            .catch(reject);
        }
      });
    });
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
