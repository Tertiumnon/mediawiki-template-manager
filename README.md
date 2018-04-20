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

Create your config (query list) in "testArticles.settings.js". Run:
```
node testArticles --[type of server] [query name] [date field name] [date from (ISO)] [date to (ISO)] [hours interval (int)]
```
* [type of server] - required,
* [query name] - required,
* [date field name] - possible values: 'Modification date', 'Creation date', any field in date-format,
* [date from (ISO)], [date to (ISO)] - possible values: 2018-01-01, 2018-01-01T00:00:00.000Z.
* [hours interval] - possible values: any integer.

If errors is logged, they will be saved at fixlist file (parameter "articles_fix_list_file_path" in "settings.js").

### Example #1

```
$ node testArticles --prod --announces
```

Articles for testing will be checking in the range between 3 days ago and today.

### Example #2

```
$ node testArticles --prod --announces 'Modification date' 2018-04-01 2018-04-05
```

Articles for testing will be checking in the range between 3 days ago and today.

## Fixing articles

1. If there is a list of articles names in fixlist file and this articles have broken semantic properties, run "node fixArticles --[type of server]".
2. This script will remove a content of this articles and then paste it back.

### Example

```
$ node fixArticles --prod
```

## Getting API results

### Example

```
$ node getAPI --test --prod --[query_name]
```