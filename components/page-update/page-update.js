const MWBot = require('mwbot');
const Page = require('../../models/page');
const settings = require('../../settings');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL alerts

// Получаем аргументы
const server = process.argv.length > 2 && process.argv[2] ? process.argv[2].slice(2) : 'default';
const summary = process.argv.length > 3 && process.argv[3] ? process.argv[3] : 'Обновление';

// Получаем список страниц для обновления
const filesListData = Page.getFileContent(settings[server].articles_upd_list_file_path);
const filesList = filesListData.split('\n');

// Готовим очередь
const batchJobs = {
  edit: {},
};
for (let i = 0; i < filesList.length; i++) {
  if (filesList[i]) {
    const x = Page.getFileNameFromPath(filesList[i]);
    const y = Page.getFileContent(settings[server].articles_path + filesList[i]);
    batchJobs.edit[x] = y;
  }
}

// Обновляем страницы
const bot = new MWBot({
  apiUrl: settings[server].server_api,
});
bot.loginGetEditToken({
  apiUrl: settings[server].server_api,
  username: settings[server].bot_user,
  password: settings[server].bot_password,
}).then(() => bot.batch(batchJobs, summary))
  .catch((err) => {
    console.log(err);
  });
