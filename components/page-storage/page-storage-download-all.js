/* eslint-disable no-console */
const path = require('path');

const PageStorage = require('./page-storage');
const settings = require('../../settings');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL alerts

// Arguments
const server = process.argv.length > 2 && process.argv[2] ? process.argv[2].slice(2) : 'default';
const argDeleteNotExistLSP = process.argv.length > 2 && process.argv[3] === '--rm-local';
const dataPath = path.join(__dirname, `../../${settings[server].pagesPath}`);

const main = async () => {
  const pageStorage = new PageStorage({
    dataPath,
    apiURL: `${settings[server].host}`,
    botData: {
      user: `${settings[server].userName}`,
      password: `${settings[server].userPassword}`,
    },
  });
  try {
    await pageStorage.getMWEditToken();
    await pageStorage.downloadAll();
    if (argDeleteNotExistLSP) {
      pageStorage.deleteNotExistLSPages();
    }
  } catch (error) {
    console.log(error);
  }
};

main();
