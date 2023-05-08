<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 40px 0">
   <img src="src/public/logo/title.png" width="600px"  height="200px" title="pretty git log" style="margin-bottom: 30px;">
   <p style="font-weight: 700; font-size: 30px;">Make Your Git Easier</p>
</div>

# Tested environment

- machine: macos Ventura 13.3.1
- runtime : node v19.8.1
- libraries
  - axios : v1.4.0
  - express : v4.18.2
  - pug : v3.0.2
  - nodemon : v2.0.20

# Prerequisites

- Install node.js runtime corresponding your machine platform. We highly recommend you to install LTS version.
  - [official node.js site](https://nodejs.org/ko)
- To run local server in your machine, you need to install 'nodemon' package globally. Follow below command. Before running this command, you should have node runtime!!
  ```
   npm i -g nodemon
  ```
- Our project doesn't guarantee that it will work on every browser. we recommend you to use chrome browser.
  - [chrome browser download](https://www.google.com/chrome/?brand=CHBD&brand=CHBD&gclid=Cj0KCQjwmN2iBhCrARIsAG_G2i6teiD4fIvR-a5CQEAxNGkxlercrsgwv6onbD1pMKGr1soGa1exmQEaAm6bEALw_wcB&gclsrc=aw.ds)

# How to run

1. clone our repo or Download source files.
   ```
    git clone https://github.com/OSS-FILEBROWSER/pretty-git.git
   ```
2. First open your terminal. Then, Go to root directory and install dependencies
   ```
   npm install
   ```
3. Run the file server by typing below command and Enjoy it!
   ```
   npm run dev
   ```

# Usages

## 1. Browse directories

You can browse directories by double clicking each directory item. But it is not allowed for you to access in files, no directories or directories that requires system permission.

<div style="display:flex; justify-content: center;"><img width ="500px" height="250px" src="src/public/gifs/browsing.gif" alt="browsing action"/></div>

Also, it is possible to go back to previous browsing history by clicking 'Go to previous' button on the left-top corner.

<div style="display:flex; justify-content: center;"><img width ="500px" height="250px" src="src/public/gifs/popback.gif" alt="browsing action"/></div>

## 2. Check Git Status

## 3.

# License

Licensed under MIT
Copyright (c) 2023- [codernineteen](https://github.com/codernineteen), [devrocket](https://github.com/devrokket), [dogmania](https://github.com/dogmania)
