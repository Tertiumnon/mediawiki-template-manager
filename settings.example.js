const initConfig = {
  userName: 'USER_NAME',
  userPassword: 'USER_PASSWORD',
  pagesPath: './data/pages',
  pagesToUpdate: './data/pages-to-edit/update.txt',
  pagesToDelete: './data/pages-to-edit/delete.txt',
  pageStorage: './data/pages-to-edit/storage.txt',
};

module.exports = {

  default: {
    host: 'https://DEFAULT-SITE/api.php',
    ...initConfig,
  },
  dev: {
    host: 'https://DEV-SITE/api.php',
    ...initConfig,
  },
  preprod: {
    host: 'https://PREPROD-SITE/api.php',
    ...initConfig,
  },
  prod: {
    host: 'https://PROD-SITE/api.php',
    ...initConfig,
  },

};
