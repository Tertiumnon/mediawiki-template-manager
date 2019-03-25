module.exports = {

  default: {
    server_api: 'http://DEFAULT_SERVER/api.php',
    articles_path: '../PATH_TO_PAGES_DIR/',
    articles_del_list_file_path: '../PATH_TO_PAGES_DIR/.articles_lists/articles_del_list.txt',
    articles_upd_list_file_path: '../PATH_TO_PAGES_DIR/.articles_lists/articles_upd_list.txt',
    bot_user: 'BOT_NAME',
    bot_password: 'BOT_PASSWORD',
  },
  prod: {
    server_api: 'https://PROD_SERVER/api.php',
    articles_path: '../PATH_TO_PAGES_DIR/',
    articles_del_list_file_path: '../PATH_TO_PAGES_DIR/.articles_lists/articles_del_list.txt',
    articles_upd_list_file_path: '../PATH_TO_PAGES_DIR/.articles_lists/articles_upd_list.txt',
    bot_user: 'BOT_NAME',
    bot_password: 'BOT_PASSWORD',
  },

};
