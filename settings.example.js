module.exports = {

  default: {
    host: 'http://DEFAULT_SERVER/api.php',
    pagesPath: '../PATH_TO_PAGES_DIR/',
    articles_del_list_file_path: '../PATH_TO_PAGES_DIR/.articles_lists/articles_del_list.txt',
    articles_upd_list_file_path: '../PATH_TO_PAGES_DIR/.articles_lists/articles_upd_list.txt',
    userName: 'BOT_NAME',
    userPassword: 'userPassword',
  },
  prod: {
    host: 'https://PROD_SERVER/api.php',
    pagesPath: '../PATH_TO_PAGES_DIR/',
    articles_del_list_file_path: '../PATH_TO_PAGES_DIR/.articles_lists/articles_del_list.txt',
    articles_upd_list_file_path: '../PATH_TO_PAGES_DIR/.articles_lists/articles_upd_list.txt',
    userName: 'BOT_NAME',
    userPassword: 'userPassword',
  },

};
