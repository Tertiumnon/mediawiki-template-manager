const gulp = require('gulp');
const watch = require('gulp-watch');
const filelog = require('gulp-filelog');
const MWBot = require('mwbot');
const Page = require('./components/page/page');
const settings = require('./settings');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // disable SSL alerts

// Получаем аргументы
const server = process.argv.length > 3 && process.argv[3] ? process.argv[3].slice(2) : 'default';
const summary = process.argv.length > 4 && process.argv[4] ? process.argv[4] : 'Stream-обновление';

gulp.task('stream', () => watch([
  `${settings[server].articles_path}/*/**/**`,
  `!${settings[server].articles_path}/.git/`,
], { ignoreInitial: true, events: ['change'], verbose: true }, (file) => {
  // Получаем название страницы
  const pageName = Page.getPagenameByFilepath(file.basename);
  console.log('>>> Open stream for page:', pageName);

  // Создаём страницу
  const p = new Page({ name: pageName, text: file.contents });

  // Подключаемся и меняем страницу
  const bot = new MWBot({
    apiUrl: settings[server].server_api,
  });
  bot.login({
    username: settings[server].bot_user,
    password: settings[server].bot_password,
  }).then(() => bot.getEditToken())
    .then(() => bot.update(p.name, p.text, summary))
    .then((response) => {
      console.log(`>>> ${response.edit.title} | ${response.edit.result}`);
    })
    .catch((err) => {
      console.log(err);
    });
})
  .pipe(filelog()));
