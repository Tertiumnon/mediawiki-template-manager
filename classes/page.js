const fs = require('fs');
const settings = require('../settings');

module.exports = class Page {
  constructor(title, text, categories) {
    this.title = title || '';
    this.text = text || '';
    this.categories = categories || [];
  }

  setCategories(categories) {
    this.categories = categories;
  }

  setText(text) {
    this.text = text;
  }

  static getFileContent(path) {
    return fs.readFileSync(settings.articles_path + path, 'utf-8');
  }

  static getByPath(path) {
    const res = new Page();
    const pathParts = path.split('/');
    const lastEl = pathParts.pop();
    const fileNamePostfixes = ['.txt', '.htm', '.html', '.mw', '.wiki', '.mediawiki'];
    const re = fileNamePostfixes.join('|');
    if (lastEl.search(re) !== -1) {
      res.title = lastEl
        .replace(' - ', ':')
        .replace('_-_', ':')
        .replace('.txt', '')
        .replace('.htm', '')
        .replace('.html', '')
        .replace('.mw', '')
        .replace('.wiki', '')
        .replace('.mediawiki', '');
      res.text = Page.getFileContent(path);
      res.categories = pathParts;
    }
    return res.title ? res : false;
  }
};
