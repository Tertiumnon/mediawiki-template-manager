let settings = require('./settings'),
  MWBot = require("mwbot");

let fs = require('fs'),
  path = require('path'),
  filePath = path.join(__dirname, './removeArticlesList.txt');

fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
  if (!err) {
    let arr = [];
    arr = data.split('\n');

    let batchJobs = {
      delete: arr
    };

    let server_api;
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
    let bot = new MWBot({
      apiUrl: server_api
    });

    bot.login({
      username: settings.bot_user,
      password: settings.bot_password
    }).then((response) => {
      bot.getEditToken().then((response) => {

        bot.batch(batchJobs, 'removing').then((response) => {
          // Success 
        }).catch((err) => {
          // Error 
        });

      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });

  } else {
    console.log(err);
  }
});