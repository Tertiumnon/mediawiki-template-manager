const MWBot = require('mwbot');
const Page = require('./page');
const settings = require('../../settings');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL alerts

// Получаем аргументы
const server = process.argv.length > 2 && process.argv[2] ? process.argv[2].slice(2) : 'default';
const summary = process.argv.length > 3 && process.argv[3] ? process.argv[3] : 'Update';

// Получаем список страниц для обновления
const filesListData = Page.getFileContent(settings[server].pagesToUpdate);
const filesList = filesListData.split('\n');

// Готовим очередь
const batchJobs = {
  edit: {},
};
for (let i = 0; i < filesList.length; i += 1) {
  if (filesList[i]) {
    const x = Page.getPagenameByFilepath(filesList[i]);
    const y = Page.getFileContent(`${settings[server].pagesPath}/${filesList[i]}`);
    batchJobs.edit[x] = y;
  }
}

// Обновляем страницы
const bot = new MWBot({
  apiUrl: settings[server].host,
});
bot.loginGetEditToken({
  apiUrl: settings[server].host,
  username: settings[server].userName,
  password: settings[server].userPassword,
}).then(() => bot.batch(batchJobs, summary))
  .catch((err) => {
    console.log(err);
  });
