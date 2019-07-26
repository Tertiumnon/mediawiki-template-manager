const fs = require('fs');
const path = require('path');

const mwbot = require('mwbot');

const Page = require('../page/page');
const settings = require('../../settings');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL alerts

// Получаем аргументы
const server = process.argv.length > 2 && process.argv[2] ? process.argv[2].slice(2) : 'default';
const pagesStorageFile = path.join(__dirname, `../../${settings[server].articles_path}/page-storage.txt`);
const pagesPath = path.join(__dirname, `../../${settings[server].articles_path}`);

console.log('Pages path:', pagesPath)

// const getPath = (dir) => {
//   fs.readdirSync(dir).forEach((item) => {
//     if (fs.lstatSync(dir + item).isFile()) {
//       pagePaths.push(dir + item);
//     } else if (ignorePaths.indexOf(item) === -1) {
//       getPath(dir + item + '/');
//     }
//   })
// };

// getPath(pagesPath);

// let pagePathsStr = '';

// pagePaths.forEach((item) => {
//   pagePathsStr += `${item}\n`;
// });

// fs.writeFileSync(pagesStorageFile, pagePathsStr);

// console.log('Page paths were saved to:', pagesStorageFile);
