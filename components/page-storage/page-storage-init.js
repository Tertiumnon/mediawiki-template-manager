const path = require('path');

const PageStorage = require('../page-storage/page-storage');
const settings = require('../../settings');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL alerts

// Получаем аргументы
const server = process.argv.length > 2 && process.argv[2] ? process.argv[2].slice(2) : 'default';
const dataPath = path.join(__dirname, `../../${settings[server].articles_path}`);

const pageStorage = new PageStorage({
  dataPath,
  apiURL: `${settings[server].server_api}`,
  botData: {
    user: `${settings[server].bot_user}`,
    password: `${settings[server].bot_password}`,
  },
});
pageStorage.init();
pageStorage.download(pageStorage.getPageList());
