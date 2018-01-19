let settings = require('./settings'),
MWBot = require("mwbot");

let fs = require('fs'),
path = require('path'),
filePath = path.join(__dirname, settings.articles_del_list_file_path),
server_api;

switch (process.argv[2]) {
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

fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
  if (!err) {
    let arr = [];
    arr = data.split('\n');

    let batchJobs = {
      delete: arr
    };

    let bot = new MWBot();

    bot.loginGetEditToken({
      apiUrl: server_api,
      username: settings.bot_user,
      password: settings.bot_password
    }).then(() => {
      return bot.batch(batchJobs, 'removing');
    }).catch((err) => {
      console.log(err);
    });

  } else {
    console.log(err);
  }
});