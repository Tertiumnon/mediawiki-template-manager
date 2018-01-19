let settings = require('./settings'),
MWBot = require("mwbot"),
fs = require('fs'),
path = require('path');

let server_api,
broken_articles_arr = [],
files_list_data,
files_list = [],
articles = {};

batchJobsRead = {},
batchJobsUpdate1 = {},
batchJobsUpdate2 = {};

batchJobsRead.read = [],
batchJobsUpdate1.update = {},
batchJobsUpdate2.update = {};

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

fs.readFile(settings.articles_fix_list_file_path, { encoding: 'utf-8' }, function (err, data) {
  if (!err) {

    articles.list = [];
    articles.list = data.split('\n');
    batchJobsRead.read = articles.list;

    let bot = new MWBot();
    bot.loginGetEditToken({
      apiUrl: server_api,
      username: settings.bot_user,
      password: settings.bot_password
    }).then(() => {
      return bot.batch(batchJobsRead);
    }).then((objects) => {
      const articles_for_read = objects.read;
      for (const article_key in articles_for_read) {
        let article_title = article_key;
        if (!article_key) continue;
        if (articles_for_read[article_key] && articles_for_read[article_key].query.pages) {
          const pages = articles_for_read[article_key].query.pages;
          for (const page_key in pages) {
            if (page_key === '-1') continue;
            article_content = '';
            batchJobsUpdate1.update[article_title] = article_content;
            article_content = pages[page_key].revisions[0]['*'];
            batchJobsUpdate2.update[article_title] = article_content;
          }
        }
      }
    }).then((response) => {
      return bot.batch(batchJobsUpdate1, 'fixing (1/2)');
    }).then((response) => {
      return bot.batch(batchJobsUpdate2, 'fixing (2/2)');
    }).catch((err) => {
      console.log(err);
    });

  } else {
    console.log(err);
  }
});