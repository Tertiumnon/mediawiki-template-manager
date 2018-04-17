let settings = require('./settings'),
  MWBot = require("mwbot"),
  pd = require("pretty-data").pd,
  fs = require('fs'),
  path = require('path'),
  diffjson_settings = require('./getAPI.settings');

class MyObj {
  // constuctor
  constructor(server_name_raw, query_name_raw) {
    this.server_name_raw = server_name_raw;
    this.query_name_raw = query_name_raw;
    this.data = {};
  }
  // getters
  get server_name() {
    return this.serialize_param(this.server_name_raw);
  }
  get server_api() {
    return this.get_server_api_link(this.server_name);
  }
  get query_name() {
    return this.serialize_param(this.query_name_raw);
  }
  get query() {
    return diffjson_settings.queries[this.query_name];
  }
  // methods
  serialize_param(param_raw) {
    return param_raw.substring(2);
  }
  get_server_api_link(param) {
    let server_api;
    switch (param) {
      case 'dev':
        server_api = settings.server_dev_api;
        break;
      case 'test':
        server_api = settings.server_test_api;
        break;
      case 'prod':
        server_api = settings.server_prod_api;
        break;
      default:
        server_api = settings.server_dev_api;
        break;
    }
    return server_api;
  }
}

let obj_1 = new MyObj(process.argv[2], process.argv[4]);
let obj_2 = new MyObj(process.argv[3], process.argv[4]);

let bot_1 = new MWBot({}, {
  timeout: 1600000
});
let bot_2 = new MWBot({}, {
  timeout: 1600000
});

bot_1.loginGetEditToken({
  apiUrl: obj_1.server_api,
  username: settings.bot_user,
  password: settings.bot_password
}).then(() => {
  return bot_1.request(obj_1.query);
}).then((response) => {
  return pd.json(response);
}).then((response) => {
  obj_1.data = response;
  return fs.writeFileSync('getAPI.file-1.json', obj_1.data, 'utf8');
}).then((response) => {
  console.log('file 1 is saved!');
}).catch((err) => {
  console.log(err);
});

bot_2.loginGetEditToken({
  apiUrl: obj_2.server_api,
  username: settings.bot_user,
  password: settings.bot_password
}).then(() => {
  return bot_2.request(obj_2.query);
}).then((response) => {
  return pd.json(response);
}).then((response) => {
  obj_2.data = response;
  return fs.writeFileSync('getAPI.file-2.json', obj_2.data, 'utf8'); 
}).then((response) => {
  console.log('file 2 is saved!');
}).catch((err) => {
  console.log(err);
});
