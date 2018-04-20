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
    if (props_to_test.indexOf(printouts[j].label) !== -1 && printouts[j][0] || printouts[j].label !== -1 && printouts[j][0] === 0) {
      props_founded++;
    } else {
      console.log(printouts[j].label);
    }
  }
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

function makeISOTimeDaysAgo(days_int) {
  let days_from_date = new Date(new Date(today).getTime() - (days_int * 24 * 60 * 60 * 1000));
  return days_from_date.toISOString();
}

function makeISOTimeToday() {
  return new Date().toISOString();
}

function makeISOTimeNext(today_iso, hours_interval) {
  let tomorrow_time = new Date(today_iso).getTime() + (hours_interval * 60 * 60 * 1000);
  return new Date(tomorrow_time).toISOString();
}

function daysToCheck(date_start_iso, date_end_iso, hours_interval) {
  let arr = [date_start_iso];
  let from_time = new Date(date_start_iso).getTime();
  let to_time = new Date(date_end_iso).getTime();
  while (from_time < to_time) {
    from_time = from_time + (hours_interval * 60 * 60 * 1000);
    arr.push(new Date(from_time).toISOString());
  }
  return arr;
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

// args 4, 5, 6

let today = makeISOTimeToday();
console.log('today', today);
let next_date;

let date_type = process.argv[4] ? process.argv[4] : 'Modification_date';
let days_from = process.argv[5] ? process.argv[5] : makeISOTimeDaysAgo(3);
let days_to = process.argv[6] ? process.argv[6] : makeISOTimeToday();
let hours_interval = process.argv[7] ? process.argv[7] : 24;
console.log('search from', days_from, 'to', days_to);
let days_to_check_arr = daysToCheck(days_from, days_to, hours_interval);

for (let day in days_to_check_arr) {

  next_date = makeISOTimeNext(days_to_check_arr[day], hours_interval);
  query_name = serializeParam(process.argv[3]);
  props_to_test = test_settings.queries[query_name].props.concat(test_settings.common_props);
  smw_query_props = serializeSemanticQueryProps(props_to_test);
  smw_dates = date_type !== false ? '[[' + date_type + '::>' + days_to_check_arr[day] + ']][[' + date_type + '::<' + next_date + ']]' : '';
  smw_query = test_settings.queries[query_name].query +
  smw_dates +
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
      console.log(' / ' + pageCounter + ' queries');
    }

    return bot.request({
        action: 'ask',
        query: smw_query
    }).then((response) => {
      
      process.stdout.write(response.query.meta.count + '.');
      
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
      console.log(' / Done!');
    }
  }).catch((err) => {
      // Error
  });

}).catch((err) => {
  console.log(err);
});