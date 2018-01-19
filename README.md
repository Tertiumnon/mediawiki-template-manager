# Installation

1. Clone this project
2. Install NodeJS packages
3. Change paths in "settings.js"

# Wiki-pages file storage

1. Save your wiki-pages to directory "./pages/src".
2. For this files use ".mediawiki" or ".html" extension.

Default file format is "Namespace_-_Page_name.extension".

Examples:

* file "pages/src/Main_Page.mediawiki" = wiki-page "Main Page"
* file "pages/src/Help_-_FAQ.mediawiki" = wiki-page "Help:FAQ"

# Basic commands

You can to:

* stream articles
* update articles
* delete articles

## Types of servers

* dev
* test
* prod

And three types of suffixes in commands, for example:

```
$ npm run update_dev
$ npm run update_test
$ npm run update_prod
```

## Create and update pages

1. Create/update and save pages in folder "pages/src/"
2. Paste list of your files for updating to "articles_upd_list.txt"
3. Run update-script
4. Wait console log and check results on your dev-server

```
$ npm run update_dev
```

## Stream pages

1. Run stream-script
2. Update and save pages in folder "pages/src/"
3. Wait console log and check results on your dev-server

```
$ npm run stream_dev
```

## Delete pages

1. Paste list of your files for removing to "articles_del_list.txt"
2. Run delete-script
3. Wait console log and check results on your dev-server

```
$ npm run delete_dev
```

# Testing and fixing semantic properties

## Testing articles

1. Create your config in "testArticles.settings.js".
2. Run "node testArticles --[type of server] [articles were created n-days ago (from)] [articles were created n-days ago (to)]".
3. If errors is logged, they will be saved at fixlist file (parameter "articles_fix_list_file_path" in "settings.js").

### Example

```
$ node testArticles --prod --testcase_1 -30 1
```

Articles for testing were created in the range between 30 days ago and today.

* "-30" - 30 days ago (from)
* "1" - including all day today (to), because "0" is today "00:00"

## Fixing articles

1. If there is a list of articles names in fixlist file and this articles have broken semantic properties, run "node fixArticles --[type of server]".
2. This script will remove a content of this articles and then paste it back.

### Example

```
$ node fixArticles --prod
```