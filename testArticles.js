let settings = require('./settings'),
  MWBot = require("mwbot"),
  fs = require('fs'),
  path = require('path'),
  test_settings = require('./testArticles.settings');

let server_api,
  broken_articles_arr = [],
  files_list_data,
  files_list = [],
  smw_queries = [],
  query_name = '';

let smw_query, smw_query_props, props_to_test;

function serializeParam(param) {
  return param.substring(2);
}

function serializeSemanticQueryProps(arr) {
  let smw_query_props = '';
  for (let i = 0; i < arr.length; i++) {
    smw_query_props += '|?' + arr[i];
  }
  return smw_query_props;
}

function checkPropertiesErrors(printouts) {
  let props_founded = 0;
  for (let j = 0; j < printouts.length; j++) {
    if (props_to_test.indexOf(printouts[j].label) !== -1 && printouts[j][0]) {
      // console.log(printouts[j].label);
      props_founded++;
    }
  }
  // console.log(props_founded, props.length);
  return props_founded != props_to_test.length;
}

function findBrokenArticles(arr) {
  let q = 0,
    broken_articles_titles = [];
  for (let i = 0; i < arr.length; i++) {
    let errors = checkPropertiesErrors(arr[i].printouts);
    if (errors) broken_articles_titles.push(arr[i].fulltext);
  }
  return broken_articles_titles;
}

// arg 2

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

// arg 4, 5

let today = new Date(),
  current_date,
  tomorrow;
today.year = today.getFullYear();
today.month = today.getMonth() + 1;
today.day = today.getDate();

let days_from = -6,
  days_to = 1;
if (process.argv[4]) days_from = parseInt(process.argv[4]);
if (process.argv[5]) days_to = parseInt(process.argv[5]);

console.log('today', today.year, today.month, today.day);
let days_from_date = new Date(today.getTime() + (days_from * 24 * 60 * 60 * 1000));
let days_from_date_iso = days_from_date.getFullYear() + '-' + (days_from_date.getMonth() + 1) + '-' + days_from_date.getDate();
let days_to_date = new Date(today.getTime() + (days_to * 24 * 60 * 60 * 1000));
let days_to_date_iso = days_to_date.getFullYear() + '-' + (days_to_date.getMonth() + 1) + '-' + days_to_date.getDate();
console.log('search from', days_from_date_iso, ' 00:00', 'to', days_to_date_iso, ' 00:00');

for (let d = days_from; d < days_to; d++) {

  current_date = new Date(today.getTime() + (d * 24 * 60 * 60 * 1000));
  current_date.year = current_date.getFullYear();
  current_date.month = current_date.getMonth() + 1;
  current_date.day = current_date.getDate();
  tomorrow = new Date(current_date.getTime() + (24 * 60 * 60 * 1000));
  tomorrow.year = tomorrow.getFullYear();
  tomorrow.month = tomorrow.getMonth() + 1;
  tomorrow.day = tomorrow.getDate();

  query_name = serializeParam(process.argv[3]);
  props_to_test = test_settings.queries[query_name].props.concat(test_settings.common_props);
  smw_query_props = serializeSemanticQueryProps(props_to_test);
  smw_query = test_settings.queries[query_name].query +
  '[[Дата создания::>' + current_date.year + '-' + current_date.month + '-' + current_date.day + ']]' +
  '[[Дата создания::<' + tomorrow.year + '-' + tomorrow.month + '-' + tomorrow.day + ']]' +
  smw_query_props +
  '|limit=1000';
  smw_queries.push(smw_query);
}

let pagesTotal = smw_queries.length || 0;
let pageCounter = 0;

let bot = new MWBot();

bot.loginGetEditToken({
  apiUrl: server_api,
  username: settings.bot_user,
  password: settings.bot_password
}).then(() => {

  return MWBot.map(smw_queries, (smw_query) => {

    pageCounter += 1;

    if (pageCounter%100 === 0) {
      console.log(pageCounter);
    }

    return bot.request({
        action: 'ask',
        query: smw_query
    }).then((response) => {

      broken_articles_arr = findBrokenArticles(response.query['results']);

      if (broken_articles_arr && broken_articles_arr.length > 0) {

        console.log(broken_articles_arr);

        let stream = fs.createWriteStream(settings.articles_fix_list_file_path, {
          flags: 'a'
        });
        
        stream.once('open', function(fd) {
          for (let i = 0; i < broken_articles_arr.length; i++) {
            const article = broken_articles_arr[i];
            stream.write(article + "\n");
          }
          stream.end();
        });

      }
      
    }).catch((err) => {
        log(err);
    });

  }, {
      concurrency: 2
  }).then((response) => {
    if (pageCounter === pagesTotal) {
      console.log('Done!', 'Broken articles:', broken_articles_arr.length);
    }
  }).catch((err) => {
      // Error
  });

}).catch((err) => {
  console.log(err);
});