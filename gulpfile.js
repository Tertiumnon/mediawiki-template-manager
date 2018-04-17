var settings = require('./settings'),
  gulp = require('gulp'),
  watch = require('gulp-watch'),
  copy = require('gulp-copy'),
  batch = require('gulp-batch'),
  del = require('del'),
  filelog = require('gulp-filelog'),
  tap = require('gulp-tap'),
  MWBot = require("mwbot");

gulp.task('stream', function () {
  // console.log(process.argv);
  // Endless stream mode 
  return watch([settings.articles_path + '*/**/**', '!' + settings.articles_path + '.git/'], { ignoreInitial: true, events: ['change'], verbose: true }, function (file) {
    // console.log(file.path, file.basename);
    let filename = file.basename
      .replace(" - ", ":")
      .replace("_-_", ":")
      .replace(".html", "")
      .replace(".htm", "")
      .replace(".mw", "")
      .replace(".md", "")
      .replace(".mediawiki", "");
    console.log(filename);

    let server_api;
    switch (process.argv[3]) {
      case '--dev':
        server_api = settings.server_dev_api;
        break;
      case '--test':
        server_api = settings.server_test_api;
        break;
      case '--prod':
        server_api = settings.server_prod_api;
        break;
      default:
        server_api = settings.server_dev_api;
        break;
    }
    let bot = new MWBot({
      apiUrl: server_api
    });

    let title = filename;
    let text = file.contents;
    let summary = '';

    bot.login({
      username: settings.bot_user,
      password: settings.bot_password
    }).then((response) => {
      bot.getEditToken().then((response) => {
        bot.update(title, text, summary).then((response) => {
          console.log(response.edit.title + ' | ' + response.edit.result);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  })
    .pipe(filelog());
});

