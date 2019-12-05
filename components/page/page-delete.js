const fs = require('fs');
const path = require('path');
const MWBot = require('mwbot');
const settings = require('../../settings');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL alerts

// Получаем аргументы
const server = process.argv.length > 2 && process.argv[2] ? process.argv[2].slice(2) : 'default';
const summary = process.argv.length > 3 && process.argv[3] ? process.argv[3] : 'Удаление устаревших страниц';

// Запускаем процесс удаления
const batchJobs = {
  delete: [],
};
fs.readFile(path.join(__dirname, settings[server].articles_del_list_file_path), { encoding: 'utf-8' }, (err, data) => {
  if (!err) {
    let arr = [];
    arr = data.split('\n');

    batchJobs.delete = arr;

    const bot = new MWBot();

    bot.loginGetEditToken({
      apiUrl: settings[server].host,
      username: settings[server].userName,
      password: settings[server].userPassword,
    }).then(() => bot.batch(batchJobs, summary)).catch((err) => {
      console.log(err);
    });
  } else {
    console.log(err);
  }
});
