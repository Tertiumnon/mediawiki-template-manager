

const MWBot = require('mwbot');
const fs = require('fs');
const settings = require('./settings');
const Page = require('./classes/page');

const ns = {
  serverAPI: '',
  fileListData: '',
  fileList: [],
  fileNamesPostfixes: ['.txt', '.htm', '.html', '.mw', '.wiki', '.mediawiki'],
  categories: [],
  pages: {},
  batchPageJobs: {},
};

ns.fileListData = Page.getFileContent(settings.articles_upd_list_file_path);
ns.fileList = ns.fileListData.split('\n');
if (!ns.fileList.length) {
  throw new Error('No file list');
}
ns.fileList.forEach((path) => {
  if (path) {
    const p = Page.getByPath(path);
    if (p) ns.pages[p.title] = p.text;
  }
});

ns.batchPageJobs = {
  edit: ns.pages,
};

switch (process.argv[2]) {
  case '--dev':
    ns.serverAPI = settings.server_dev_api;
    break;
  case '--test':
    ns.serverAPI = settings.server_test_api;
    break;
  case '--prod':
    ns.serverAPI = settings.server_prod_api;
    break;
  default:
    ns.serverAPI = settings.server_dev_api;
    break;
}

const bot = new MWBot();

bot
  .loginGetEditToken({
    apiUrl: ns.serverAPI,
    username: settings.bot_user,
    password: settings.bot_password,
  })
  .then(() => bot.batch(ns.batchPageJobs, 'update'))
  .catch((err) => {
    throw new Error(err);
  });
