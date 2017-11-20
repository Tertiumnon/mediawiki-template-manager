# Installation

1. Clone this project
2. Install NodeJS packages
3. Change paths in "settings.js"

# Commands

You can to
* stream
* update
* remove

There are three types of servers: dev, test and prod. And three types of suffixes in commands:
* npm run update_dev
* npm run update_test
* npm run update_prod

# Page names

Default file format is "Namespace - Page name".

Examples:
* file "pages/src/Main Page.mediawiki" => wiki-page "Main Page"
* file "pages/src/Help - FAQ.mediawiki" => wiki-page "Help:FAQ"

# Create and update pages

1. Create/update and save pages in folder "pages/src/"
2. Paste list of your files for updating to "updateArticlesList.txt"
3. Run "npm run update_dev"
4. Wait console log and check results on your dev-server

# Stream pages

1. Run "npm run stream_dev"
2. Update and save pages in folder "pages/src/"
3. Wait console log and check results on your dev-server

# Remove pages

1. Paste list of your files for removing to "removeArticlesList.txt"
2. Run "npm run remove_dev"
3. Wait console log and check results on your dev-server