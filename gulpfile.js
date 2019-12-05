const gulp = require('gulp');
const watch = require('gulp-watch');
const filelog = require('gulp-filelog');
const MWBot = require('mwbot');
const Page = require('./components/page/page');
const settings = require('./settings');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // disable SSL alerts

// Get command-line arguments
const server = process.argv.length > 3 && process.argv[3] ? process.argv[3].slice(2) : 'default';
const summary = process.argv.length > 4 && process.argv[4] ? process.argv[4] : 'Page streaming';

// Stream files
gulp.task('stream', () => watch([
  `${settings[server].pagesPath}/**/**/**`,
  `!${settings[server].pagesPath}/.git/`,
], { ignoreInitial: true, events: ['change'], verbose: true }, (file) => {

  // Prepare
  const pageName = Page.getPagenameByFilepath(file.basename);
  console.log('>>> Open stream for page:', pageName);
  const p = new Page({ name: pageName, text: file.contents });

  // Make changes
  const bot = new MWBot({
    apiUrl: settings[server].host,
  });
  bot.login({
    username: settings[server].userName,
    password: settings[server].userPassword,
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
