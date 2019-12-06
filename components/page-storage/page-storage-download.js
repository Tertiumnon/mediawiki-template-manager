const path = require('path');

const PageStorage = require('../page-storage/page-storage');
const settings = require('../../settings');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL alerts

// Arguments
const server = process.argv.length > 2 && process.argv[2] ? process.argv[2].slice(2) : 'default';
const pagename = process.argv.length > 3 && process.argv[3] ? process.argv[3] : '';
if (!pagename) throw new Error('No pagename');

const main = async () => {
  const dataPath = path.join(__dirname, `../../${settings[server].pagesPath}`);
  const pageStorage = new PageStorage({
    dataPath,
    apiURL: `${settings[server].host}`,
    botData: {
      user: `${settings[server].userName}`,
      password: `${settings[server].userPassword}`,
    },
  });
  try {
    await pageStorage.getEditToken();
    await pageStorage.download([pagename]);
  } catch (error) {
    console.log(error);
  }
};

main();
