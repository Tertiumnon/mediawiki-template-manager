const fs = require('fs');
const settings = require('./settings');

const gpl = {
  pagePaths: [],
  fpathsExcluded: ['.git', settings.articles_lists_path],
};

switch (process.argv[2]) {
  case '--local':
    gpl.serverAPI = '';
    break;
  case '--dev':
    gpl.serverAPI = settings.server_dev_api;
    break;
  case '--test':
    gpl.serverAPI = settings.server_test_api;
    break;
  case '--prod':
    gpl.serverAPI = settings.server_prod_api;
    break;
  default:
    gpl.serverAPI = '';
    break;
}

const getFilePaths = (pagePath, isRoot) => {
  fs.readdirSync(pagePath).forEach((pageName) => {
    if (!gpl.fpathsExcluded.includes(pageName)) {
      const pagePathNew = isRoot ? pagePath + pageName : `${pagePath}/${pageName}`;
      gpl.pagePaths.push(pagePathNew.replace(settings.articles_path, ''));
      if (fs.lstatSync(pagePathNew).isDirectory()) {
        getFilePaths(pagePathNew);
      }
    }
  });
};

const saveFilePaths = (pagePaths) => {
  const pagePathsStr = pagePaths.join('\n');
  fs.writeFileSync(settings.articles_upd_list_file_path, pagePathsStr, { flag: 'w+' });
};

if (gpl.serverAPI === '') {
  getFilePaths(settings.articles_path, true);
  saveFilePaths(gpl.pagePaths);
}
