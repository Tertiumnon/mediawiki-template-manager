const fs = require('fs');
const path = require('path');

const settings = require('../../settings');

// Получаем аргументы
const server = process.argv.length > 2 && process.argv[2] ? process.argv[2].slice(2) : 'default';
const pagesStorageFile = path.join(__dirname, `../../${settings[server].pagesPath}/page-storage.txt`);
const pagesPath = path.join(__dirname, `../../${settings[server].pagesPath}`);

console.log('Pages path:', pagesPath);

const pagePaths = [];
const ignorePaths = ['.git', 'node_modules'];

const getPath = (dir) => {
  fs.readdirSync(dir).forEach((item) => {
    if (fs.lstatSync(dir + item).isFile()) {
      pagePaths.push(dir + item);
    } else if (ignorePaths.indexOf(item) === -1) {
      getPath(`${dir + item}/`);
    }
  });
};

getPath(pagesPath);

let pagePathsStr = '';

pagePaths.forEach((item) => {
  pagePathsStr += `${item}\n`;
});

fs.writeFileSync(pagesStorageFile, pagePathsStr);

console.log('Page paths were saved to:', pagesStorageFile);
